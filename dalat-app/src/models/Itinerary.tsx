import { ItineraryDay } from "./ItineraryDay";
import { User } from "./User";

export interface Itinerary {
    id: number;
    title: string;
    user: User;
    days: ItineraryDay[];
    startDate: string;
    endDate: string;
    totalDays: number;
    totalCost: number;
    totalPlaces: number;
}