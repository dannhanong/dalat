import pandas as pd
import numpy as np
from math import radians, cos, sin, asin, sqrt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import SessionLocal
from models.place import Place
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

# 🚀 Hàm gợi ý địa điểm (Không cần place_id)
def recommend_places(user_lat: float, user_lon: float, max_distance=5000, max_price: int = 60000, top_n=5):
    places = get_places_from_db()
    
    # Tạo DataFrame từ dữ liệu
    df = pd.DataFrame([{
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

    # Lọc theo giá (≤ max_price)
    df = df[df["adult_fare"] <= max_price]

    # 🌍 Tính khoảng cách từ người dùng đến từng địa điểm
    df["distance"] = df.apply(lambda row: haversine(user_lat, user_lon, row["latitude"], row["longitude"]), axis=1)

    # 💰 Lọc theo khoảng cách (≤ max_distance km)
    df = df[df["distance"] <= max_distance]

    # 🔹 Xử lý dữ liệu đầu vào cho Content-Based Filtering
    df["features"] = df["category_id"].astype(str) + " " + df["description"].fillna("")

    # 🔹 Vector hóa TF-IDF
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(df["features"])

    # 🔹 Tính toán độ tương đồng Cosine giữa tất cả địa điểm
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # ✅ Chuyển đổi thành DataFrame
    similarity_df = pd.DataFrame(cosine_sim, index=df["id"], columns=df["id"])

    # ✅ Tính tổng độ tương đồng của từng địa điểm
    df["similarity_score"] = similarity_df.sum(axis=1)

    # ✅ Sắp xếp theo độ tương đồng giảm dần, sau đó theo khoảng cách tăng dần
    df = df.sort_values(by=["distance", "similarity_score", "adult_fare"], ascending=[False, True, True])

    # Lấy top_n địa điểm
    recommended_places = df.head(top_n)[["id", "name", "category_id", "description", "latitude", "longitude", "adult_fare", "child_fare", "distance", "similarity_score", "image_code"]]

    # 🔹 Trả về danh sách gợi ý
    return recommended_places.to_dict(orient="records")

# 📌 Gọi API test
print(json.dumps(recommend_places(21.028511, 105.804817), indent=4, ensure_ascii=False))