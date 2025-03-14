import { getProfile, isAuthenticated } from '@/services/auth';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProfileContextType {
    profile: {
        name: string;
        phoneNumber: string;
        avatarUrl: string;
    };
    setProfile: React.Dispatch<React.SetStateAction<{
        name: string;
        phoneNumber: string;
        avatarUrl: string;
    }>>;
    reloadProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

interface ProfileProviderProps {
    children: React.ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
    const [profile, setProfile] = useState({
        name: '',
        phoneNumber: '',
        avatarUrl: ''
    });

    const reloadProfile = async () => {
        if (isAuthenticated()) {
            try {
                const data = await getProfile();
                const { name, phoneNumber, avatarCode } = data;
                const avatarUrl = avatarCode ? `${process.env.NEXT_PUBLIC_API_URL}/files/preview/${avatarCode}` : 'https://firebasestorage.googleapis.com/v0/b/lvkmusic.appspot.com/o/umgu5ofe2y?alt=media&token=d9756614-c86c-4269-b46e-8d4b8b2f02d3';
                setProfile({ name, phoneNumber, avatarUrl });
            } catch (error) {
                console.error('Lỗi khi tải thông tin người dùng:', error);
            }
        }
    };

    useEffect(() => {
        reloadProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, setProfile, reloadProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};