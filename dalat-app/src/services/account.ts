import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getAllAccounts = async (keyword: string, page: number) => {
    try {
        const response = await axios.get(`${baseUrl}/auth/admin/get-all-users`, {
            params: { keyword, page },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const blockAccount = async (id: number) => {
    try {
        const response = await axios.put(`${baseUrl}/auth/admin/block/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}