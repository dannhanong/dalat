import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const signup = async (name: string, username: string, email: string, password: string, confirmPassword: string) => {
    try {
        const response = await axios.post(`${baseUrl}/auth/signup`, {
            name,
            username,
            email,
            password,
            confirmPassword
        });
        return response.data;
    } catch (error) {
        console.error('Error during signup:', error);
        throw error;
    }
};

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${baseUrl}/auth/login`, {
            username,
            password
        });
        
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.data.accessToken);
        }

        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

export const logout = async () => {
    if (typeof window !== 'undefined') {
        const response = await axios.post(`${baseUrl}/auth/logout`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        });
        
        if (response) {
            localStorage.removeItem('accessToken');
        }
        return response;
    }
};

export const forgotPassword = async (email: string) => {
    try {
        const response = await axios.post(`${baseUrl}/auth/forgot-password/${email}`);
        return response;
    } catch (error) {
        console.error('Error during forgot password:', error);
        throw error;
    }
}

export const isAuthenticated = () => {
    if (typeof window !== 'undefined') {
        return Boolean(localStorage.getItem('accessToken'));
    }
    return false; // Mặc định là chưa đăng nhập khi chạy trên server
};

export const decodeToken = () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        return jwtDecode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const isAdmin = async () => {
    const decodedToken = decodeToken();
    if (!decodedToken || !decodedToken.roles) return false;
    return decodedToken.roles.includes('ADMIN');
}

export const isAdminLogin = () => {
    const decodedToken = decodeToken();
    if (!decodedToken || !decodedToken.roles) return false;
    return decodedToken.roles.includes('ADMIN');
}

export const getAccessToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

export const getProfile = async () => {
    try {
        const token = getAccessToken();
        if (!token) {
            throw new Error('Token không tồn tại');
        }

        const response = await axios.get(`${baseUrl}/auth/get/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting profile:', error);
        throw error;
    }
}

export const changePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    try {
        const response = await axios.put(`${baseUrl}/auth/change-password`, {
            oldPassword,
            newPassword,
            confirmPassword
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        throw error;
    }
};

export const updateProfile = async (name: string, phoneNumber: string, avatar?: File) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phoneNumber', phoneNumber);
    if (avatar) {
        formData.append('avatar', avatar);
    }

    try {
        const response = await axios.put(`${baseUrl}/auth/update-profile`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        throw error;
    }
};