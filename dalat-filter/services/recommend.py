from typing import List, Optional
import pandas as pd
import numpy as np
from math import radians, cos, sin, asin, sqrt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import SVD, Dataset, Reader
from surprise.model_selection import train_test_split
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import SessionLocal
from models.place import Place
from models.wishlist import Wishlist
from models.user_feedback import UserFeedback
from models.place_hobby import PlaceHobby
from models.place_service import PlaceService
import base64
import json

# Hàm tính khoảng cách giữa hai tọa độ (Haversine Formula)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Bán kính Trái Đất (km)
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    return R * c  # Khoảng cách tính theo km

# Lấy dữ liệu địa điểm từ MySQL
def get_places_from_db():
    db: Session = SessionLocal()
    places = db.query(
            Place.id,
            Place.name, 
            Place.category_id,
            Place.description,
            Place.latitude,
            Place.longitude, 
            Place.adult_fare,
            Place.child_fare,
            Place.image_code,
            Place.other_images,
            # Đảm bảo chuyển đổi đúng kiểu
            (Place.show == True).label('show')
        ).all()
    db.close()
    return places

# Lấy dữ liệu đánh giá từ MySQL
def get_feedback_from_db():
    db: Session = SessionLocal()
    feedbacks = db.query(UserFeedback).all()
    db.close()
    return feedbacks

# Lấy dữ liệu từ wishlist
def get_wishlist_from_db():
    db: Session = SessionLocal()
    wishlists = db.query(Wishlist).all()
    db.close()
    return wishlists

# Hàm gợi ý địa điểm bằng Hybrid Recommendation System
def hybrid_recommend(
    user_id: int,
    user_lat: float,
    user_lon: float,
    max_distance=5000,
    price: int = 100000000,
    alpha=0.7,
    beta=0.3,
    wishlist_boost=0.5,  # Parameter to control wishlist influence
    top_n=5,
    category_ids: Optional[List[int]] = None,
    hobby_ids: Optional[List[int]] = None,
    service_ids: Optional[List[int]] = None,
    keyword: Optional[str] = None
):
    try:
        places = get_places_from_db()
        feedbacks = get_feedback_from_db()
        wishlists = get_wishlist_from_db()  # Get wishlist data

        df_places = pd.DataFrame([{
            "id": p.id,
            "name": p.name,
            "category_id": p.category_id,
            "description": p.description if p.description else "",
            "latitude": p.latitude,
            "longitude": p.longitude,
            "adult_fare": p.adult_fare,
            "child_fare": p.child_fare,
            "image_code": p.image_code,
            "other_images": p.other_images,
            "show": p.show
        } for p in places])

        print("df_places", df_places)

        #**Lọc theo `show`**
        df_places = df_places[df_places["show"] == True]

        #**Lọc theo keyword**
        if keyword:
            df_places = df_places[df_places["name"].str.contains(keyword, case=False) | df_places["description"].str.contains(keyword, case=False)]

        #**Lọc theo category**
        if category_ids:
            df_places = df_places[df_places["category_id"].isin(category_ids)]

        # Lọc theo giá tiền
        df_places = df_places[df_places["adult_fare"] <= price]

        # Tính khoảng cách
        df_places["distance"] = df_places.apply(lambda row: haversine(user_lat, user_lon, row["latitude"], row["longitude"]), axis=1)

        # Lọc theo khoảng cách
        df_places = df_places[df_places["distance"] <= max_distance]

        #**Lọc theo `hobby_ids`**
        if hobby_ids:
            print("hobby_ids", hobby_ids)
            db = SessionLocal()
            filtered_place_ids = db.query(PlaceHobby.place_id).filter(PlaceHobby.hobby_id.in_(hobby_ids)).distinct().all()
            db.close()

            filtered_place_ids = [p[0] for p in filtered_place_ids]  # Chuyển tuple thành list

            df_places = df_places[df_places["id"].isin(filtered_place_ids)]

        #**Lọc theo `service_ids`**
        if service_ids:
            print("service_ids", service_ids)
            db = SessionLocal()
            filtered_place_ids = db.query(PlaceService.place_id).filter(PlaceService.service_id.in_(service_ids)).distinct().all()
            db.close()

            filtered_place_ids = [p[0] for p in filtered_place_ids]  # Chuyển tuple thành list

            df_places = df_places[df_places["id"].isin(filtered_place_ids)]

        # Xử lý Content-Based Filtering (TF-IDF)
        df_places["features"] = df_places["category_id"].astype(str) + " " + df_places["description"].fillna("")
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(df_places["features"])
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        similarity_df = pd.DataFrame(cosine_sim, index=df_places["id"], columns=df_places["id"])

        df_places["similarity_score"] = similarity_df.sum(axis=1)

        # Xử lý Collaborative Filtering (SVD)
        if feedbacks:
            df_feedback = pd.DataFrame([{
                "user_id": f.user_id,
                "place_id": f.place_id,
                "rating": f.rating
            } for f in feedbacks])

            reader = Reader(rating_scale=(1, 5))
            data = Dataset.load_from_df(df_feedback[["user_id", "place_id", "rating"]], reader)
            trainset, testset = train_test_split(data, test_size=0.2)

            model = SVD()
            model.fit(trainset)

            unique_users = df_feedback["user_id"].unique()
            if user_id in unique_users:
                df_places["predicted_rating"] = df_places["id"].apply(lambda x: model.predict(user_id, x).est)
            else:
                df_places["predicted_rating"] = df_feedback["rating"].mean()
        else:
            df_places["predicted_rating"] = 3.0  # Nếu không có feedback nào

        # Add wishlist boost to places in user's wishlist
        user_wishlist_places = [w.place_id for w in wishlists if w.user_id == user_id]
        df_places["in_wishlist"] = df_places["id"].isin(user_wishlist_places)
        
        # Add wishlist score
        df_places["wishlist_score"] = df_places["in_wishlist"].astype(float) * wishlist_boost

        print("df_places", df_places["wishlist_score"])

        # **Tạo final_score kết hợp `hybrid_score` và `distance`**
        df_places["normalized_distance"] = 1 - (df_places["distance"] / df_places["distance"].max())  # Chuẩn hóa khoảng cách
        df_places["final_score"] = (alpha * df_places["similarity_score"] + 
                                   beta * df_places["predicted_rating"] + 
                                   df_places["wishlist_score"]) + (0.3 * df_places["normalized_distance"])

        df_places = df_places.sort_values(by=["final_score"], ascending=False)

        # Lấy top_n địa điểm
        recommended_places = df_places.head(top_n)[["id"]]

        return recommended_places.to_dict(orient="records")
    except Exception as e:
        print(f"Error in hybrid_recommend: {e}")
        return []

print(json.dumps(hybrid_recommend(1, 21.028511, 105.804817, max_distance=5000, price=100000000, alpha=0.7, beta=0.3, top_n=5, category_ids=[3], hobby_ids=[1, 2]), indent=4, ensure_ascii=False))

def hybrid_recommend_extended(
    user_id: int,
    user_lat: float,
    user_lon: float,
    max_distance=5000,
    price=100000000,
    alpha=0.7,
    beta=0.3,
    wishlist_boost=0.5,
    category_ids: Optional[List[int]] = None,
    hobby_ids: Optional[List[int]] = None,
    service_ids: Optional[List[int]] = None,
):
    # Lấy danh sách địa điểm đã lọc và tính điểm giống như hàm cũ
    places = get_places_from_db()
    feedbacks = get_feedback_from_db()
    wishlists = get_wishlist_from_db()

    df_places = pd.DataFrame([{
        "id": p.id,
        "name": p.name,
        "category_id": p.category_id,
        "description": p.description if p.description else "",
        "latitude": p.latitude,
        "longitude": p.longitude,
        "adult_fare": p.adult_fare,
        "child_fare": p.child_fare,
        "image_code": p.image_code,
        "show": p.show
    } for p in places])

    # Lọc theo `show`
    df_places = df_places[df_places["show"] == True]

    # Lọc theo category, giá, khoảng cách, hobby_ids
    if category_ids:
        df_places = df_places[df_places["category_id"].isin(category_ids)]
    df_places = df_places[df_places["adult_fare"] <= price]
    df_places["distance"] = df_places.apply(lambda row: haversine(user_lat, user_lon, row["latitude"], row["longitude"]), axis=1)
    df_places = df_places[df_places["distance"] <= max_distance]

    if hobby_ids:
        db = SessionLocal()
        filtered_place_ids = db.query(PlaceHobby.place_id).filter(PlaceHobby.hobby_id.in_(hobby_ids)).distinct().all()
        df_places = df_places[df_places["id"].isin([p[0] for p in filtered_place_ids])]
        db.close()

    if service_ids:
        db = SessionLocal()
        filtered_place_ids = db.query(PlaceService.place_id).filter(PlaceService.service_id.in_(service_ids)).distinct().all()
        df_places = df_places[df_places["id"].isin([p[0] for p in filtered_place_ids])]
        db.close()

    # Tính similarity_score và predicted_rating
    df_places["features"] = df_places["category_id"].astype(str) + " " + df_places["description"].fillna("")
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(df_places["features"])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    similarity_df = pd.DataFrame(cosine_sim, index=df_places["id"], columns=df_places["id"])
    df_places["similarity_score"] = similarity_df.sum(axis=1)

    if feedbacks:
        df_feedback = pd.DataFrame([{"user_id": f.user_id, "place_id": f.place_id, "rating": f.rating} for f in feedbacks])
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(df_feedback[["user_id", "place_id", "rating"]], reader)
        trainset, _ = train_test_split(data, test_size=0.2)
        model = SVD()
        model.fit(trainset)
        df_places["predicted_rating"] = df_places["id"].apply(lambda x: model.predict(user_id, x).est)
    else:
        df_places["predicted_rating"] = 3.0

    user_wishlist_places = [w.place_id for w in wishlists if w.user_id == user_id]
    df_places["in_wishlist"] = df_places["id"].isin(user_wishlist_places)
    df_places["wishlist_score"] = df_places["in_wishlist"].astype(float) * wishlist_boost

    df_places["normalized_distance"] = 1 - (df_places["distance"] / df_places["distance"].max())
    df_places["final_score"] = (alpha * df_places["similarity_score"] + 
                                beta * df_places["predicted_rating"] + 
                                df_places["wishlist_score"]) + (0.3 * df_places["normalized_distance"])

    # Trả về toàn bộ danh sách đã sắp xếp theo điểm
    return df_places.sort_values(by="final_score", ascending=False)