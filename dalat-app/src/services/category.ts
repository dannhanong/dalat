import { Category } from '@/models/Category';
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getCategories = async (keyword: string, page: number) => {
    try {
        const response = await axios.get(`${baseUrl}/categories/public/all?size=1000`, {
            params: { keyword, page }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const getCategoryById = async (id: number) => {
    try {
        const response = await axios.get(`${baseUrl}/categories/public/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const createCategory = async (category: Category) => {
    try {
        const response = await axios.post(`${baseUrl}/categories/admin/create`, category, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const updateCategory = async (id: number, category: Category) => {
    try {
        const response = await axios.put(`${baseUrl}/categories/admin/update/${id}`, category, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const deleteCategory = async (id: number) => {
    try {
        const response = await axios.delete(`${baseUrl}/categories/admin/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const createService = async (serviceData: any) => {
    try {
        const response = await axios.post(`${baseUrl}/services/admin/create`, serviceData, {
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

export const updateService = async (id: number, service: any) => {
    try {
        const response = await axios.put(`${baseUrl}/services/admin/update/${id}`, service, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const deleteService = async (id: number) => {
    try {
        const response = await axios.delete(`${baseUrl}/services/admin/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}