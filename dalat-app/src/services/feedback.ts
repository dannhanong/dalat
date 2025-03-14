import axios from 'axios';
import { pl } from 'date-fns/locale';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getFeedbacks = async (placeId: number, page: number) => {
    try {
        const response = await axios.get(`${baseUrl}/feedbacks/public/all/${placeId}`, {
            params: { page }
        });
        return response.data;
    } catch (error) {
        console.error('Error during getFeedbacks:', error);
        throw error;
    }
}

export const createFeedback = async (data: any) => {
    try {
        const response = await axios.post(`${baseUrl}/feedbacks/private/create`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        return response.data;} catch (error) {
        console.error('Error during createFeedback:', error);
        throw error;
    }
}