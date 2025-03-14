"use client";

import { useEffect, useState } from "react";
import AttractionCard from "@/components/home/AttractionCard";
import FilterSidebar from "@/components/home/FilterSidebar";
import SearchBar from "@/components/home/SearchBar";
import { getRecommend } from "@/services/place";
import { ToastContainer } from "react-toastify";
import { Button, Box, Typography, CircularProgress, Grid } from "@mui/material";
import { getUserLocation } from "@/services/utils";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
    const [places, setPlaces] = useState([]);
    const [price, setPrice] = useState(100000000);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedHobbies, setSelectedHobbies] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [topN, setTopN] = useState<number>(6);
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [selectedMaxDistance, setSelectedMaxDistance] = useState<number>(5000);
    const [userLat, setUserLat] = useState<number>(11.90);
    const [userLon, setUserLon] = useState<number>(108.60);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRecommendPlaces = async () => {
        setIsLoading(true);
        try {
            const response = await getRecommend({
                user_id: null,
                user_lat: userLat,
                user_lon: userLon,
                max_distance: selectedMaxDistance,
                price: price,
                top_n: topN,
                category_ids: selectedCategories,
                hobby_ids: selectedHobbies,
                service_ids: selectedServices,
                keyword: searchTerm
            }, 1);
            setPlaces(response.content || []);
        } catch (error) {
            console.error(error);
            setPlaces([]);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchMyLocation = async () => {
        try {
            const location = await getUserLocation();        
            if (location) {
                setUserLat(location.latitude);
                setUserLon(location.longitude);
            }
        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };

    useEffect(() => {
        fetchRecommendPlaces();
    }, [topN, selectedCategories, selectedHobbies, selectedServices, price, searchTerm, selectedMaxDistance]);

    useEffect(() => {
        fetchMyLocation();
    }, []);

    return (
        <Box 
            display="flex" 
            bgcolor="#f5f5f5"
            sx={{ minHeight: "88vh", padding: 6 }}
        >
            {/* Sidebar */}
            <FilterSidebar
                setPrice={setPrice}
                setSelectedCategories={setSelectedCategories}
                setSelectedHobbies={setSelectedHobbies}
                setSelectedServices={setSelectedServices}
                setSelectedMaxDistance={setSelectedMaxDistance}
            />

            {/* Main Content */}
            <Box flex={1} p={3}>
                {/* Search Bar */}
                <SearchBar setSearchTerm={setSearchTerm} />

                {/* Results */}
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                        <CircularProgress />
                    </Box>
                ) : places.length > 0 ? (
                    <Box>
                        <Box sx={{ mt: 2, borderRadius: 1, overflow: 'hidden' }}>
                            <Grid container spacing={3}>
                                {places.map((place, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <AttractionCard 
                                            attraction={place} 
                                            onWishlistChange={fetchRecommendPlaces}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Pagination */}
                        <Box width="100%" display="flex" justifyContent="end" mt={4}>
                            <Button
                                onClick={() => setTopN(topN + 6)}
                                variant="contained"
                                disabled={places.length < topN}
                                sx={{ px: 4 }}
                            >
                                Xem thêm
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        height="60vh"
                        flexDirection="column"
                    >
                        <Typography variant="h5" fontWeight="medium" color="text.secondary">
                            Không tìm thấy địa điểm phù hợp
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mt={1}>
                            Vui lòng thử lại với các bộ lọc khác
                        </Typography>
                    </Box>
                )}
            </Box>
            <ToastContainer />
        </Box>
    );
}