import { Festival } from '@/models/Festival';
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getFestivals = async (startDate?: string, endDate?: string) => {
    try {
        let url = `${baseUrl}/festivals/public/grouped`;
        
        if (startDate && endDate) {
            url = `${baseUrl}/festivals/public/by-date/grouped?startDate=${startDate}&endDate=${endDate}`;
        }
        
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getFestivalById = async (id: number) => {
    try {
        const response = await axios.get(`${baseUrl}/festivals/public/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getAllFestivals = async (keyword: string, page: number) => {
    try {
        const response = await axios.get(`${baseUrl}/festivals/public/all`, {
            params: { keyword, page }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const createFestival = async (festival: Festival) => {
    try {
        const response = await axios.post(`${baseUrl}/festivals/admin/create`, festival, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const updateFestival = async (id: number, festival: Festival) => {
    try {
        const response = await axios.put(`${baseUrl}/festivals/admin/update/${id}`, festival, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteFestival = async (id: number) => {
    try {
        const response = await axios.delete(`${baseUrl}/festivals/admin/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}