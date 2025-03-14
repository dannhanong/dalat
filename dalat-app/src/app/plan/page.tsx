"use client";

import SearchBar from "@/components/home/SearchBar";
import Pagination from "@/components/Pagination";
import TourCard from "@/components/plan/TourCard";
import TourFilter from "@/components/plan/TourFilter";
import { Itinerary } from "@/models/Itinerary";
import { getItinerariesByUser, getTravelRecommend } from "@/services/itinerary";
import { getUserLocation } from "@/services/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Plan() {
    const router = useRouter();
    const [price, setPrice] = useState(100000000);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedHobbies, setSelectedHobbies] = useState<number[]>([]);
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [tourTemplates, setTourTemplates] = useState([]);
    const [selectedMaxDistance, setSelectedMaxDistance] = useState<number>(5000);
    const [myItineraries, setMyItineraries] = useState<Itinerary[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [userLat, setUserLat] = useState<number>(11.90);
    const [userLon, setUserLon] = useState<number>(108.60);
    const [numAdults, setNumAdults] = useState<number>(4);
    const [numChildren, setNumChildren] = useState<number>(2);

    const fetchMyTravelRecommend = async () => {
        try {
            const response = await getTravelRecommend({
                user_lat: userLat,
                user_lon: userLon,
                num_days: selectedDuration,
                budget: price,
                num_adults: numAdults,
                num_children: numChildren,
                max_distance: 1111,
                category_ids: selectedCategories,
                hobby_ids: selectedHobbies,
                service_ids: selectedServices,
            });
            setTourTemplates(response);
            sessionStorage.setItem('tourTemplates', JSON.stringify(response));
        } catch (error) {
            console.error('Error fetching travel recommend:', error);
            setTourTemplates([]);
            sessionStorage.removeItem('tourTemplates');
        }
    }

    const fetchMyLocation = async () => {
        const location = await getUserLocation();
        if (location) {
            setUserLat(location.latitude);
            setUserLon(location.longitude);
        }
    };

    const fetchMyItineraries = async () => {
        try {
            const response = await getItinerariesByUser(searchTerm, currentPage);
            setMyItineraries(response.content);
            sessionStorage.setItem('myItineraries', JSON.stringify(response));
            setTotalPages(response.page.totalPages);
        } catch (error) {
            console.error('Error fetching my itineraries:', error);
            setMyItineraries([]);
            sessionStorage.removeItem('myItineraries');
        }
    }

    const handleTourCardClick = () => {
        router.push('/plan/0');
    }

    useEffect(() => {
        fetchMyTravelRecommend();
    }, [selectedCategories, selectedHobbies, selectedServices, price, searchTerm, selectedMaxDistance, selectedDuration, numAdults, numChildren]);

    useEffect(() => {
        fetchMyItineraries();
    }, [searchTerm, currentPage]);

    useEffect(() => {
        fetchMyLocation();
    }, []);

    return (
        <div className="flex bg-white px-20" style={{ minHeight: "88vh" }}>
            <TourFilter
                setPrice={setPrice}
                setSelectedCategories={setSelectedCategories}
                setSelectedHobbies={setSelectedHobbies}
                setSelectedServices={setSelectedServices}
                setSelectedDurationChange={setSelectedDuration}
                setSelectedMaxDistance={setSelectedMaxDistance}
                setNumAdults={setNumAdults}
                setNumChildren={setNumChildren}
            />
            <div className="flex-1 p-6">
                <div className="mb-4">
                    <SearchBar setSearchTerm={setSearchTerm} />
                </div>
                <h2 className="text-2xl font-bold">Lịch trình đề xuất</h2>
                {tourTemplates.length > 0 ? (
                    <div
                        className="flex flex-wrap -mx-4 p-4 grid-cols-3 gap-6 hover:cursor-pointer"
                        onClick={handleTourCardClick}
                    >
                        <TourCard
                            title={"Lịch trình đề xuất"}
                            cost={price}
                            days={selectedDuration}
                            places={tourTemplates.length}
                            image={""}
                        />
                    </div>
                )
                    : (
                        <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                                <p className="mt-2">Không đề xuất được lịch trình phù hợp</p>
                            </div>
                        </div>
                    )}

                <div className="mt-6">
                    <h2 className="text-2xl font-bold mt-4">Lịch trình của tôi</h2>
                    <div className="flex flex-wrap -mx-4 mt-4">
                        {myItineraries.map((itinerary: Itinerary) => (
                            <div
                                key={itinerary.id}
                                onClick={() => router.push(`/plan/${itinerary.id}`)}
                                className="w-1/3 p-4 hover:cursor-pointer"
                            >
                                <TourCard
                                    key={itinerary.id}
                                    title={itinerary.title}
                                    cost={itinerary.totalCost}
                                    days={itinerary.totalDays}
                                    places={itinerary.totalPlaces}
                                    image={""}
                                />
                            </div>
                        ))}

                        <div className="w-full px-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(newPage) => setCurrentPage(newPage)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}