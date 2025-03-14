export interface RecommendRequest {
    user_id?: number | null;
    user_lat?: number;
    user_lon?: number;
    max_distance?: number;
    price?: number;
    top_n?: number;
    category_ids?: number[];
    hobby_ids?: number[];
    service_ids?: number[];
    keyword?: string;
}