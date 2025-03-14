import pandas as pd
import numpy as np
from math import radians, cos, sin, asin, sqrt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import SVD, Dataset, Reader
from surprise.model_selection import train_test_split
from sqlalchemy.orm import Session
from database import SessionLocal
from models.place import Place
from models.user_feedback import UserFeedback
import json

# 🌍 Hàm tính khoảng cách giữa hai tọa độ (Haversine Formula)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Bán kính Trái Đất (km)
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    return R * c  # Khoảng cách tính theo km

# 📌 Lấy dữ liệu địa điểm từ MySQL
def get_places_from_db():
    db: Session = SessionLocal()
    places = db.query(Place).all()
    db.close()
    return places

# 📌 Lấy dữ liệu đánh giá từ MySQL
def get_feedback_from_db():
    db: Session = SessionLocal()
    feedbacks = db.query(UserFeedback).all()
    db.close()
    return feedbacks

# 🚀 Hàm gợi ý địa điểm bằng Hybrid Recommendation System
def hybrid_recommend(user_id: int, user_lat: float, user_lon: float, max_distance=5000, alpha=0.7, beta=0.3, top_n=5):
    places = get_places_from_db()
    feedbacks = get_feedback_from_db()

    # Tạo DataFrame từ dữ liệu địa điểm
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
        "creator_id": p.creator_id
    } for p in places])

    # 🌍 Tính khoảng cách từ người dùng đến từng địa điểm
    df_places["distance"] = df_places.apply(lambda row: haversine(user_lat, user_lon, row["latitude"], row["longitude"]), axis=1)

    # 💰 Lọc theo khoảng cách (≤ max_distance km)
    df_places = df_places[df_places["distance"] <= max_distance]

    # print(f"ℹ️ Có {len(df_places)} địa điểm phù hợp")

    # 🔹 Xử lý dữ liệu đầu vào cho Content-Based Filtering
    df_places["features"] = df_places["category_id"].astype(str) + " " + df_places["description"].fillna("")

    # 🔹 Vector hóa TF-IDF
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(df_places["features"])

    # 🔹 Tính toán độ tương đồng Cosine giữa tất cả địa điểm
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # ✅ Chuyển đổi thành DataFrame
    similarity_df = pd.DataFrame(cosine_sim, index=df_places["id"], columns=df_places["id"])

    # ✅ Tính tổng độ tương đồng của từng địa điểm
    df_places["similarity_score"] = similarity_df.sum(axis=1)

    # 🔹 Collaborative Filtering (Dự đoán điểm đánh giá bằng SVD)
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

        # Dự đoán rating cho từng địa điểm
        df_places["predicted_rating"] = df_places["id"].apply(lambda x: model.predict(user_id, x).est)
    else:
        df_places["predicted_rating"] = 3.0  # Giá trị mặc định nếu không có feedback

    # ✅ Tính điểm Hybrid Score: α * similarity_score + β * predicted_rating
    df_places["hybrid_score"] = alpha * df_places["similarity_score"] + beta * df_places["predicted_rating"]

    # ✅ Sắp xếp theo Hybrid Score (giảm dần), nếu bằng điểm thì theo khoảng cách (tăng dần)
    df_places = df_places.sort_values(by=["hybrid_score", "distance"], ascending=[False, True])

    # Lấy top_n địa điểm
    recommended_places = df_places.head(top_n)[["id", "name", "category_id", "description", "latitude", "longitude", "adult_fare", "child_fare", "distance", "similarity_score", "predicted_rating", "hybrid_score"]]

    # 🔹 Trả về danh sách gợi ý
    return recommended_places.to_dict(orient="records")

# 📌 Gọi API test
print(json.dumps(hybrid_recommend(user_id=1, user_lat=21.028511, user_lon=105.804817), indent=4, ensure_ascii=False))