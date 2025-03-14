import { RecommendRequest } from '@/models/RecommendRequest';
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getRecommend = async (recommendRequest: RecommendRequest, page: number) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            const response = await axios.post(`${baseUrl}/places/public/get-place-recommend`, recommendRequest, {
                params: { page }
            });
            return response.data;
        }

        const response = await axios.post(`${baseUrl}/places/public/get-place-recommend`, recommendRequest, {
            params: { page },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during getRecommend:', error);
        throw error;
    }
};

export const getLookUpPlace = async (placeName: string) => {
    try {
        const response = await axios.post(`${baseUrl}/places/private/look-up`, {placeName}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during getLookUpPlace:', error);
        throw error;
    }
}

export const createPlace = async (formData: FormData) => {
    try {
        const response = await axios.post(`${baseUrl}/places/private/create`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during createPlace:', error);
        throw error;
    }
}

export const getAllServicesByCategoryIdId = async (categoryId: number) => {
    try {
        const response = await axios.get(`${baseUrl}/services/public/get-by-category/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error during getAllServicesByPlaceId:', error);
        throw error;
    }
}

export const getPlaceById = async (placeId: number) => {
    try {
        const response = await axios.get(`${baseUrl}/places/public/${placeId}`);
        return response.data;
    } catch (error) {
        console.error('Error during getPlaceById:', error);
        throw error;
    }
}

export const getServicesByCategoryId = async (categoryId: number) => {
    try {
        const response = await axios.get(`${baseUrl}/services/public/get-by-category/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error during getServicesByCategoryId:', error);
        throw error;
    }
}

export const getAllPlaces = async (keyword: string, page: number) => {
    try {
        const response = await axios.get(`${baseUrl}/places/public/all`, {
            params: { keyword, page }
        });
        return response.data;
    } catch (error) {
        console.error('Error during getAllPlaces:', error);
        throw error;
    }
}

export const updateShow = async (placeId: number) => {
    try {
        const response = await axios.put(`${baseUrl}/places/admin/update-show/${placeId}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during updateShow:', error);
        throw error;
    }
}