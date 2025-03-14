import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getLocation = async (address: string) => {
    try {
        const response = await axios.get(`${baseUrl}/public/get-location?address=${address}`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const getUserLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                async (error) => {
                    console.warn("⚠️ Không thể lấy vị trí GPS:", error.message);
                    console.log("🔄 Đang thử lấy vị trí qua IP...");

                    // Nếu GPS bị từ chối, gọi API lấy vị trí theo IP
                    try {
                        const res = await fetch("http://localhost:8000/get-location"); // Gọi FastAPI hoặc API vị trí
                        const data = await res.json();
                        if (data.latitude && data.longitude) {
                            console.log("✅ Lấy vị trí từ IP:", data);
                            resolve({ latitude: data.latitude, longitude: data.longitude });
                        } else {
                            resolve(null);
                        }
                    } catch (ipError) {
                        console.error("❌ Lỗi khi lấy vị trí từ IP:", ipError);
                        resolve(null);
                    }
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            console.warn("⚠️ Trình duyệt không hỗ trợ GPS!");
            resolve(null);
        }
    });
};

export const sendLocationToServer = async (latitude: number, longitude: number) => {
    try {
        const response = await axios.post("http://localhost:8080/user/location", {
            latitude,
            longitude,
        });
        return response.data;
    } catch (error) {
        console.error("Error sending location to server:", error);
        return null;
    }
};