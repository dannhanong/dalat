import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getMyWishlist = async (keyword: string, page: number, size: number) => {
    try {
        const accessToken = localStorage.getItem('accessToken');

        const response = await axios.get(`${baseUrl}/wishlist/private/my-wishlist`, {
            params: { keyword, page, size },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during getWishlist:', error);
        throw error;
    }
};

export const addToWishlist = async (placeId: number) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.post(`${baseUrl}/wishlist/private/add/${placeId}`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during addToWishlist:', error);
        throw error;
    }
}

export const removeFromWishlist = async (id: number) => {
    try {
        const accessToken = localStorage.getItem('accessToken');

        const response = await axios.delete(`${baseUrl}/wishlist/private/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during removeFromWishlist:', error);
        throw error;
    }
}
