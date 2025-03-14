export interface TravelPlanRequest {
    user_lat: number;
    user_lon: number;
    num_days: number;
    budget: number;
    num_adults: number;
    num_children: number;
    max_distance: number;
    category_ids: number[];
    hobby_ids: number[];
    service_ids: number[];
    start_date?: string;
}