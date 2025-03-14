from typing import Dict, List, Optional
import json
import sys
import os
from datetime import datetime, timedelta
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.recommend import hybrid_recommend_extended, haversine

# Thêm hàm để ước tính thời gian di chuyển
def estimate_travel_time(distance_km):
    """Ước tính thời gian di chuyển dựa trên khoảng cách (km)"""
    # Giả sử tốc độ trung bình là 30km/h trong thành phố
    speed_km_per_hour = 30
    travel_time_hours = distance_km / speed_km_per_hour
    return travel_time_hours * 60  # Chuyển sang phút

# Thêm hàm để ước tính thời gian tham quan dựa trên loại địa điểm
def estimate_visit_duration(category_id):
    """Ước tính thời gian tham quan (phút) dựa trên loại địa điểm"""
    # Điều chỉnh theo nhu cầu thực tế
    duration_map = {
        1: 120,
        2: 180,
        3: 90,
    }
    return duration_map.get(category_id, 60)  # Mặc định 60 phút

def create_travel_plan(
    user_id: int,
    user_lat: float,
    user_lon: float,
    num_days: int,
    budget: int,
    num_adults: int,
    num_children: int,
    max_distance=5000,
    category_ids: Optional[List[int]] = None,
    hobby_ids: Optional[List[int]] = None,
    service_ids: Optional[List[int]] = None,
    start_date: Optional[str] = None,  # Thêm ngày bắt đầu theo định dạng 'YYYY-MM-DD'
    start_time: str = "08:00"  # Thời gian bắt đầu mỗi ngày
) -> Dict:
    # Xử lý ngày bắt đầu
    if start_date:
        current_date = datetime.strptime(start_date, '%Y-%m-%d')
    else:
        current_date = datetime.now()
        
    # Lấy danh sách địa điểm từ hàm hybrid_recommend_extended
    df_places = hybrid_recommend_extended(
        user_id, 
        user_lat, 
        user_lon, 
        max_distance=max_distance, 
        category_ids=category_ids, 
        hobby_ids=hobby_ids,
        service_ids=service_ids
    )

    # Tính chi phí cho mỗi địa điểm dựa trên số người
    df_places["total_cost"] = (df_places["adult_fare"] * num_adults) + (df_places["child_fare"] * num_children)
    
    # Thêm thời gian thăm quan ước tính
    df_places["visit_duration"] = df_places["category_id"].apply(estimate_visit_duration)

    # Ước tính số địa điểm mỗi ngày
    places_per_day = min(5, len(df_places) // num_days if num_days > 0 else 1)
    total_places_needed = places_per_day * num_days

    # Lọc địa điểm theo ngân sách
    df_places = df_places.iloc[:total_places_needed]
    if df_places["total_cost"].sum() > budget:
        df_places = df_places[df_places["total_cost"].cumsum() <= budget]

    # Tạo kế hoạch phân bổ địa điểm cho từng ngày
    plan = {}
    total_cost = 0
    current_lat, current_lon = user_lat, user_lon  # Điểm xuất phát ban đầu

    for day in range(1, num_days + 1):
        # Cập nhật ngày hiện tại
        day_date = (current_date + timedelta(days=day-1)).strftime("%Y-%m-%d")
        current_time = datetime.strptime(f"{day_date} {start_time}", "%Y-%m-%d %H:%M")
        
        # Lấy địa điểm cho ngày hiện tại
        start_idx = (day - 1) * places_per_day
        end_idx = start_idx + places_per_day
        day_places = df_places.iloc[start_idx:end_idx]

        if day_places.empty:
            break

        day_plan = []
        for _, place in day_places.iterrows():
            # Tính khoảng cách và thời gian di chuyển
            distance_from_last = haversine(current_lat, current_lon, place["latitude"], place["longitude"])
            travel_time_minutes = estimate_travel_time(distance_from_last)
            
            # Cập nhật thời gian đến (thêm thời gian di chuyển)
            arrival_time = current_time + timedelta(minutes=travel_time_minutes)
            
            # Thời gian tham quan
            visit_duration = place["visit_duration"]
            departure_time = arrival_time + timedelta(minutes=visit_duration)
            
            day_plan.append({
                "id": place["id"],
                "name": place["name"],
                "latitude": place["latitude"],
                "longitude": place["longitude"],
                "adult_fare": place["adult_fare"],
                "child_fare": place["child_fare"],
                "total_cost": place["total_cost"],
                "distance_from_last": distance_from_last,
                "travel_time_minutes": travel_time_minutes,
                "arrival_time": arrival_time.strftime("%H:%M"),
                "departure_time": departure_time.strftime("%H:%M"),
                "visit_duration_minutes": visit_duration
            })
            total_cost += place["total_cost"]
            
            # Cập nhật vị trí và thời gian cho địa điểm tiếp theo
            current_lat, current_lon = place["latitude"], place["longitude"]
            current_time = departure_time

        plan[f"d{day}"] = {
            "date": day_date,
            "places": day_plan
        }

    return {
        "travel_plan": plan,
        "total_cost": total_cost,
        "total_places": len(df_places),
        "total_adults": num_adults,
        "toal_children": num_children,
        "currency": "VND"
    }

# Ví dụ sử dụng
plan = create_travel_plan(
    user_id=1,
    user_lat=21.028511,
    user_lon=105.804817,
    num_days=5,
    budget=5000000,
    num_adults=5,
    num_children=1,
    max_distance=10000,
    category_ids=[1, 2, 3],
    hobby_ids=[1, 2],
    start_date="2025-03-10",  # Thêm ngày bắt đầu
    start_time="08:30"  # Thời gian bắt đầu mỗi ngày
)
print(json.dumps(plan, indent=4, ensure_ascii=False))