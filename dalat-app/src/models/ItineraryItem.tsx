import { ItineraryDay } from "./ItineraryDay";
import { Place } from "./Place";

export interface ItineraryItem {
    id: number;
    day: ItineraryDay;
    place: Place;
    visitTime: string;
}