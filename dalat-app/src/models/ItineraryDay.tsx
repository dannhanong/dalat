import { Itinerary } from "./Itinerary";
import { ItineraryItem } from "./ItineraryItem";

export interface ItineraryDay {
    id: number;
    itinerary: Itinerary;
    dayNumber: number;
    dayCost: number;
    date: string;
    items: ItineraryItem[];
}