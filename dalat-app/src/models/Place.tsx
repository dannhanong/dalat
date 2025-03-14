import { Category } from "./Category";

export interface Place {
    id: number;
    name: string;
    category: Category;
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
    description: string;
    imageCode: string;
    otherImages: string[];
    show: boolean;
    childFare: number;
    adultFare: number;
    // creator: User;
    openTime: string;
    closeTime: string;
    // hobbies: Hobby[];
    wishlisted: boolean;
}