export interface PlaceRequest {
    name: string;
    categoryId: number[];
    address: string;
    latitude: number;
    longitude: number;
    description: string;
    images: File[] | null;
    childFare: number;
    adultFare: number;
    hobbyIds: number[];
}
    