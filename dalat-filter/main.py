from fastapi import FastAPI, HTTPException, Query, Request
from typing import List, Optional
from pydantic import BaseModel
from services.recommend import hybrid_recommend
from services.travel_plan import create_travel_plan
import requests

app = FastAPI()

# DTO cho request
class RecommendRequest(BaseModel):
    user_id: Optional[int] = None
    user_lat: float
    user_lon: float
    max_distance: Optional[float] = 5000
    price: Optional[int] = 100000000
    alpha: Optional[float] = 0.6
    beta: Optional[float] = 0.4
    top_n: int = 5,
    category_ids: Optional[List[int]] = None
    hobby_ids: Optional[List[int]] = None
    service_ids: Optional[List[int]] = None
    keyword: Optional[str] = None

class TravelPlanRequest(BaseModel):
    user_id: int
    user_lat: float
    user_lon: float
    num_days: int
    budget: int
    num_adults: int
    num_children: int
    max_distance: Optional[float] = 5000
    category_ids: Optional[List[int]] = None
    hobby_ids: Optional[List[int]] = None
    service_ids: Optional[List[int]] = None
    start_date: Optional[str] = None
    start_time: Optional[str] = "08:00"

# DTO cho response
class RecommendResponse(BaseModel):
    id: int
    # name: str
    # category_id: int
    # description: str
    # latitude: float
    # longitude: float
    # adult_fare: float
    # child_fare: float
    # distance: float
    # image_code: str
    # other_images: List[str] = []
    # similarity_score: float
    # predicted_rating: float
    # hybrid_score: float

class PlaceDetail(BaseModel):
    id: int
    name: Optional[str] = None
    arrival_time: Optional[str] = None
    departure_time: Optional[str] = None
    visit_duration_minutes: Optional[int] = None
    travel_time_minutes: Optional[float] = None
    total_cost: Optional[int] = None
    
class DayPlan(BaseModel):
    date: str
    places: List[PlaceDetail]
    
class TravelPlanResponse(BaseModel):
    day: int
    date: str
    places: List[PlaceDetail]
    daily_cost: int
    total_adults: int
    toal_children: int

@app.post("/recommendations", response_model=List[RecommendResponse])
def get_recommendations(
    request: RecommendRequest,
    page: int = Query(1, ge=1),  # Trang bắt đầu từ 1
    size: int = Query(10, ge=1, le=50)  # Số lượng phần tử mỗi trang
):
    try:
        print(request)
        recommendations = hybrid_recommend(
            user_id=request.user_id,
            user_lat=request.user_lat,
            user_lon=request.user_lon,
            max_distance=request.max_distance,
            price=request.price,
            alpha=request.alpha,
            beta=request.beta,
            top_n=request.top_n,
            hobby_ids=request.hobby_ids,
            service_ids=request.service_ids,
            category_ids=request.category_ids,
            keyword=request.keyword
        )

        # Tính toán offset
        start_idx = (page - 1) * size
        end_idx = start_idx + size

        return recommendations[start_idx:end_idx]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-location")
def get_location(request: Request):
    # Lấy IP của người dùng từ request
    client_ip = request.client.host

    # Dùng ipinfo.io để lấy thông tin vị trí
    response = requests.get(f"https://ipinfo.io/{client_ip}/json")
    
    if response.status_code == 200:
        data = response.json()
        location = data.get("loc", "").split(",")  # loc có dạng "lat,lon"
        if len(location) == 2:
            return {
                "ip": client_ip,
                "latitude": float(location[0]),
                "longitude": float(location[1]),
                "city": data.get("city", "Unknown"),
                "region": data.get("region", "Unknown"),
                "country": data.get("country", "Unknown"),
            }
    
    return {"error": "Không thể lấy vị trí"}

@app.post("/travel-plan")
def get_travel_plan(request: TravelPlanRequest):
    try:
        travel_plan_result = create_travel_plan(
            user_id=request.user_id,
            user_lat=request.user_lat,
            user_lon=request.user_lon,
            num_days=request.num_days,
            budget=request.budget,
            num_adults=request.num_adults,
            num_children=request.num_children,
            max_distance=request.max_distance,
            category_ids=request.category_ids,
            hobby_ids=request.hobby_ids,
            service_ids=request.service_ids,
            start_date=request.start_date if hasattr(request, 'start_date') else None,
            start_time=request.start_time if hasattr(request, 'start_time') else "08:00"
        )

        response = []
        for day_key, day_data in travel_plan_result["travel_plan"].items():
            day_number = int(day_key[1:]) 
            day_places = []
            daily_cost = 0
            
            for place in day_data["places"]:
                day_places.append(PlaceDetail(
                    id=place["id"],
                    name=place.get("name", ""),
                    arrival_time=place.get("arrival_time", ""),
                    departure_time=place.get("departure_time", ""),
                    visit_duration_minutes=place.get("visit_duration_minutes", 0),
                    travel_time_minutes=place.get("travel_time_minutes", 0),
                    total_cost=place.get("total_cost", 0)
                ))
                daily_cost += place.get("total_cost", 0)
            
            response.append(TravelPlanResponse(
                day=day_number,
                date=day_data["date"],
                places=day_places,
                daily_cost=daily_cost,
                total_adults=request.num_adults,
                toal_children=request.num_children
            ))

        response.sort(key=lambda x: x.day)
        return response
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(error_details)
        raise HTTPException(status_code=500, detail=str(e))