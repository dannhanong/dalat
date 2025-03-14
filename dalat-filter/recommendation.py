import pandas as pd
import numpy as np
from math import radians, cos, sin, asin, sqrt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
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

# 🚀 Hàm gợi ý địa điểm (Sắp xếp theo Độ tương đồng + Khoảng cách)
def recommend_places(place_id: int, user_lat: float, user_lon: float, max_distance=2000, price_range=2, top_n=5):
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

    # Kiểm tra xem place_id có tồn tại không
    if place_id not in df["id"].values:
        return []

    # 🔍 Lấy thông tin địa điểm gốc
    target_place = df[df["id"] == place_id].iloc[0]
    target_price = target_place["adult_fare"]

    # 🌍 Lọc theo khoảng cách (≤ max_distance km)
    df["distance"] = df.apply(lambda row: haversine(user_lat, user_lon, row["latitude"], row["longitude"]), axis=1)
    df = df[df["distance"] <= max_distance]

    # 💰 Lọc theo giá (± price_range %)
    min_price = target_price * (1 - price_range)
    max_price = target_price * (1 + price_range)
    df = df[(df["adult_fare"] >= min_price) & (df["adult_fare"] <= max_price)]

    # Nếu không còn địa điểm nào sau khi lọc
    if df.empty:
        return []

    # 🔹 Xử lý dữ liệu đầu vào cho Content-Based Filtering
    df["features"] = df["category_id"].astype(str) + " " + df["description"].fillna("")

    # 🔹 Vector hóa TF-IDF
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(df["features"])

    # 🔹 Tính toán độ tương đồng Cosine
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # 🔹 Lấy danh sách các địa điểm tương tự
    idx = df.index[df["id"] == place_id][0]
    sim_scores = list(enumerate(cosine_sim[idx]))

    # ✅ Sắp xếp theo Độ tương đồng trước, Khoảng cách sau
    sim_scores = sorted(sim_scores, key=lambda x: (-x[1], df.iloc[x[0]]["distance"]))

    # Lấy danh sách ID của địa điểm được gợi ý
    place_indices = [df.iloc[i[0]]["id"] for i in sim_scores[1:top_n+1]]
    recommended_places = df[df["id"].isin(place_indices)][["id", "name", "category_id", "description", "latitude", "longitude", "adult_fare", "distance"]]

    # 🔹 Giữ nguyên thứ tự theo độ tương đồng (giảm dần) và khoảng cách (tăng dần)
    recommended_places = recommended_places.set_index("id").loc[place_indices].reset_index().to_dict(orient="records")
    
    return recommended_places

print(json.dumps(recommend_places(1, 21.028511, 105.804817), indent=4, ensure_ascii=False))