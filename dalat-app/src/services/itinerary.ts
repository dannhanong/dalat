import { TravelPlanRequest } from '@/models/TravelPlanRequest';
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getTravelRecommend = async (travelPlanRequest: TravelPlanRequest) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            const response = await axios.post(`${baseUrl}/services/private/travel-plan`, travelPlanRequest, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            return response.data;
        }
    } catch (error) {
        console.error('Error during getRecommend:', error);
        throw error;
    }
};

export const getItinerariesByUser = async (keyword: string, page: number) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            const response = await axios.get(`${baseUrl}/itineraries/private/my-itineraries`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    keyword,
                    page,
                }
            });
            return response.data;
        }
    } catch (error) {
        console.error('Error during getItinerariesByUser:', error);
        throw error;
    }
}

export const getItineraryById = async (id: number) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            const response = await axios.get(`${baseUrl}/itineraries/private/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            return response.data;
        }
    } catch (error) {
        console.error('Error during getItineraryById:', error);
        throw error;
    }
}

export const removePlaceFromItinerary = async (itemId: number) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            const response = await axios.delete(`${baseUrl}/itineraries/private/remove-place/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            return response.data;
        }
    } catch (error) {
        console.error('Error during removePlaceFromItinerary:', error);
        throw error;
    }
}

export const createItinerary = async (data: any) => {
    try {
        const response = await axios.post(`${baseUrl}/itineraries/private/create`, data , {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return {
            success: true,
            message: 'Hành trình đã được tạo thành công',
            data: response.data
        };
    } catch (error: any) {
        console.error('Error creating itinerary:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Đã xảy ra lỗi khi tạo hành trình',
            error
        };
    }
};

export const removeDayFromItinerary = async (dayId: number) => {
    try {
        const response = await axios.delete(`${baseUrl}/itineraries/private/remove-day/${dayId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error removing day from itinerary:', error);
        return { 
            success: false, 
            message: 'Đã xảy ra lỗi, vui lòng thử lại sau' 
        };
    }
};

export const addPlaceToItinerary = async (dayId: number, data: any) => {
    try {
        const response = await axios.put(`${baseUrl}/itineraries/private/add-place/${dayId}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error adding place to itinerary:', error);
        return { 
            success: false, 
            message: 'Đã xảy ra lỗi, vui lòng thử lại sau' 
        };
    }
}