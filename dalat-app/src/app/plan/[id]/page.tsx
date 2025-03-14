"use client";

import TravelPlan from "@/components/TravelPlan";
import { getItineraryById } from "@/services/itinerary";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function Index() {
    const { id } = useParams();
    const [planType, setPlanType] = useState<string>('');
    const [tourData, setTourData] = useState<any[]>([]);
    
    // Tạo hàm fetchData có thể sử dụng lại
    const fetchData = useCallback(async () => {
        if (Number(id) === 0) {
            setPlanType(' đề xuất');
            
            // Lấy dữ liệu từ sessionStorage
            const storedData = sessionStorage.getItem('tourTemplates');
            if (storedData) {
                setTourData(JSON.parse(storedData));
            }
        } else {
            setPlanType(' của tôi');

            try {
                const storedData = await getItineraryById(Number(id));
                setTourData(storedData);
            } catch (error) {
                console.error("Error fetching itinerary data:", error);
            }
        }
    }, [id]);

    // Load dữ liệu lần đầu
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return <TravelPlan 
        planType={planType} 
        tourData={tourData} 
        onDataChange={fetchData} 
        isTemplate={Number(id) === 0}
    />;
}