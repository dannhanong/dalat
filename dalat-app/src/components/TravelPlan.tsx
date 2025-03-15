'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Box, Typography, Button, Divider, Grid, Tabs, Tab, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { DeleteIcon } from 'lucide-react';
import { addPlaceToItinerary, createItinerary, removeDayFromItinerary, removePlaceFromItinerary } from '@/services/itinerary';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import { AddCircle } from '@mui/icons-material';
import PlaceSelectionDialog from './plan/PlaceSelectionDialog';
import TimeSelectionDialog from './plan/TimeSelectionDialog';

// Styled components
const CustomBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: theme.spacing(3),
}));

const MapContainerStyled = styled(Box)({
    height: '400px',
    width: '100%',
    position: 'relative',
    marginBottom: '24px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
});

const PlanDetailContainer = styled(Box)({
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
});

const TimelineItem = styled(Box)({
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '24px',
    position: 'relative',
});

const TimelineDot = styled(Box)({
    width: '14px',
    height: '14px',
    backgroundColor: '#f59e0b',
    borderRadius: '50%',
    marginRight: '16px',
    marginTop: '6px',
});

// Dynamic import cho map component
const MapWithNoSSR = dynamic(
    () => import('./LeafletMap'),
    { ssr: false }
);

interface TravelPlanProps {
    planType: string;
    tourData?: any[];
    onDataChange?: () => void; // Add onDataChange as a prop
    isTemplate?: boolean;
}

const TravelPlan: React.FC<TravelPlanProps> = ({
    planType,
    tourData = [],
    onDataChange, // Add onDataChange as a prop
    isTemplate = false
}) => {
    const [selectedDay, setSelectedDay] = useState<number>(0);
    const [isPlaceDialogOpen, setIsPlaceDialogOpen] = useState(false);
    const [currentDayId, setCurrentDayId] = useState<number | null>(null);
    const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
    const [selectedTimes, setSelectedTimes] = useState<{ visitTime: string, leaveTime: string }>({
        visitTime: '08:00',
        leaveTime: '10:00'
    });

    // Tính tổng chi phí
    const totalCost = useMemo(() => {
        return tourData.reduce((sum, day) => sum + (day.daily_cost || 0), 0);
    }, [tourData]);

    // Tính tổng số địa điểm
    const totalPlaces = useMemo(() => {
        return tourData.reduce((sum, day) => {
            return sum + (day.places ? day.places.length : 0);
        }, 0);
    }, [tourData]);

    const handleSavePlanRecommend = async () => {
        try {
            // Hiển thị dialog để nhập thông tin lịch trình
            const { value: formValues, isConfirmed } = await Swal.fire({
                title: 'Lưu lịch trình đề xuất',
                html: `
                    <div style="text-align: left; margin-bottom: 15px;">
                        <label for="swal-input1" style="display: block; margin-bottom: 5px; font-weight: bold;">Tên lịch trình</label>
                        <input id="swal-input1" class="swal2-input" placeholder="Nhập tên lịch trình" value="Chuyến du lịch Đà Lạt ${tourData.length} ngày">
                    </div>
                    <div style="text-align: left;">
                        <label for="swal-input4" style="display: block; margin-bottom: 5px; font-weight: bold;">Ngày bắt đầu</label>
                        <input id="swal-input4" type="date" class="swal2-input" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Lưu lịch trình',
                cancelButtonText: 'Hủy',
                preConfirm: () => {
                    const title = (document.getElementById('swal-input1') as HTMLInputElement).value;
                    // const adults = parseInt((document.getElementById('swal-input2') as HTMLInputElement).value);
                    // const children = parseInt((document.getElementById('swal-input3') as HTMLInputElement).value);
                    const adults = tourData[0].total_adults;
                    const children = tourData[0].toal_children;
                    const startDate = (document.getElementById('swal-input4') as HTMLInputElement).value;

                    if (!title) {
                        Swal.showValidationMessage('Vui lòng nhập tên lịch trình');
                        return false;
                    }

                    if (isNaN(adults) || adults < 1) {
                        Swal.showValidationMessage('Số người lớn phải lớn hơn 0');
                        return false;
                    }

                    if (isNaN(children) || children < 0) {
                        Swal.showValidationMessage('Số trẻ em không hợp lệ');
                        return false;
                    }

                    if (!startDate) {
                        Swal.showValidationMessage('Vui lòng chọn ngày bắt đầu');
                        return false;
                    }

                    return { title, adults, children, startDate };
                }
            });

            if (!isConfirmed) return;

            // Parse thông tin từ form
            const { title, adults, children, startDate } = formValues;

            console.log("formValues", formValues);


            // Tính toán ngày kết thúc dựa trên số ngày của lịch trình
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(startDate);
            endDateObj.setDate(startDateObj.getDate() + tourData.length - 1);

            const endDate = endDateObj.toISOString().split('T')[0];

            // Chuẩn bị cấu trúc days cho API
            const daysForApi = tourData.map((day, index) => {
                // Tính ngày cho mỗi day dựa trên ngày bắt đầu
                const currentDate = new Date(startDate);
                currentDate.setDate(startDateObj.getDate() + index);
                const dateString = currentDate.toISOString().split('T')[0];

                // Chuẩn bị items (places) cho mỗi ngày
                const items = day.places?.map(place => {
                    // Parse thời gian đến/đi
                    let visitTimeStr = place.arrival_time || '08:00';
                    let departureTimeStr = place.departure_time || '10:00';

                    // Tạo datetime đầy đủ cho API
                    const visitTime = `${dateString}T${visitTimeStr}:00`;
                    const departureTime = `${dateString}T${departureTimeStr}:00`;

                    return {
                        placeId: place.id || place.place_id,
                        visitTime,
                        departureTime
                    };
                }) || [];

                return {
                    dayNumber: day.day,
                    date: dateString,
                    items
                };
            });

            // Chuẩn bị payload cuối cùng cho API
            const payload = {
                title,
                startDate,
                endDate,
                totalAdults: adults,
                totalChildren: children,
                days: daysForApi
            };

            console.log('Saving itinerary with payload:', payload);

            // Gọi API để lưu lịch trình
            const response = await createItinerary(payload);

            if (response) {
                toast.success('Đã lưu lịch trình thành công!');
            } else {
                toast.error('Có lỗi xảy ra khi lưu lịch trình');
            }
        } catch (error) {
            console.error('Error saving plan recommend:', error);
            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau', { autoClose: 3000 });
        }
    }

    const openAddPlaceDialog = (dayId: number) => {
        setCurrentDayId(dayId);

        // Tính toán thời gian mặc định
        let defaultArrivalTime = '08:00';
        let defaultDepartureTime = '10:00';

        const currentDay = tourData.find(day => day.day_id === dayId);
        if (currentDay && currentDay.places && currentDay.places.length > 0) {
            const lastPlace = currentDay.places[currentDay.places.length - 1];
            if (lastPlace.departure_time) {
                defaultArrivalTime = lastPlace.departure_time;

                // Tính thời gian rời đi mặc định là sau 2 giờ
                const [hours, minutes] = lastPlace.departure_time.split(':').map(Number);
                const departureDate = new Date();
                departureDate.setHours(hours, minutes, 0);
                departureDate.setTime(departureDate.getTime() + 2 * 60 * 60 * 1000); // Thêm 2 giờ

                defaultDepartureTime = `${departureDate.getHours().toString().padStart(2, '0')}:${departureDate.getMinutes().toString().padStart(2, '0')}`;
            }
        }

        setSelectedTimes({
            visitTime: defaultArrivalTime,
            leaveTime: defaultDepartureTime
        });

        // Mở dialog chọn thời gian trước
        setIsTimeDialogOpen(true);
    };

    const handleTimeConfirm = (visitTime: string, leaveTime: string) => {
        setSelectedTimes({
            visitTime,
            leaveTime
        });

        // Đóng dialog thời gian và mở dialog chọn địa điểm
        setIsTimeDialogOpen(false);
        setIsPlaceDialogOpen(true);
    };

    const handleAddPlaceToDay = async (selectedPlace: any) => {
        if (!currentDayId) return;

        try {
            // Tìm ngày hiện tại để lấy thông tin ngày tháng
            const currentDay = tourData.find(day => day.day_id === currentDayId);
            if (!currentDay || !currentDay.date) {
                toast.error("Không tìm thấy thông tin ngày");
                return;
            }

            // Lấy ngày từ currentDay.date (giả định format là "YYYY-MM-DD")
            let dateStr = currentDay.date;

            // Nếu date có định dạng khác, cần chuyển đổi cho phù hợp
            // Ví dụ nếu date có định dạng "DD/MM/YYYY", chuyển thành "YYYY-MM-DD"
            if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }

            // Tạo datetime đầy đủ từ ngày và giờ
            const visitDateTime = `${dateStr}T${selectedTimes.visitTime}:00`;
            const leaveDateTime = `${dateStr}T${selectedTimes.leaveTime}:00`;

            // Tạo dữ liệu để gửi đi, sử dụng thời gian đã được chọn
            const placeData = {
                placeId: selectedPlace.id,
                visitTime: visitDateTime,
                leaveTime: leaveDateTime
            };

            console.log('Sending data to API:', placeData);

            const response = await addPlaceToItinerary(currentDayId, placeData);

            if (response && response.success) {
                toast.success("Đã thêm địa điểm vào lịch trình!");

                // Reload data
                if (onDataChange) {
                    onDataChange();
                }
            } else {
                toast.error(response?.message || "Không thể thêm địa điểm. Vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Error adding place to itinerary:", error);
            toast.error("Đã xảy ra lỗi khi thêm địa điểm!");
        } finally {
            setIsPlaceDialogOpen(false);
            setCurrentDayId(null);
        }
    };

    // Tạo mảng locations cho ngày được chọn
    const selectedDayLocations = useMemo(() => {
        const locations: any[] = [];

        if (tourData && tourData.length > 0 && tourData[selectedDay]) {
            const dayPlan = tourData[selectedDay];
            if (dayPlan.places && Array.isArray(dayPlan.places)) {
                dayPlan.places.forEach(place => {
                    if (place.latitude && place.longitude) {
                        locations.push({
                            lat: place.latitude,
                            lng: place.longitude,
                            title: place.name || `Place ${place.id}`,
                            id: place.id
                        });
                    }
                });
            }
        }

        return locations;
    }, [tourData, selectedDay]);

    const handleRemoveDay = async (dayId: number) => {
        console.log('Day ID to remove:', dayId);

        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc muốn xóa ngày này khỏi lịch trình? Tất cả các địa điểm trong ngày này sẽ bị xóa.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            cancelButtonColor: '#3085d6'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Thực hiện request API
                    const response = await removeDayFromItinerary(dayId);

                    if (response && response.success) {
                        toast.success('Đã xóa ngày khỏi lịch trình', { autoClose: 3000 });

                        // Cập nhật state và UI
                        if (tourData.length > 1) {
                            // Nếu đây là ngày đang được chọn và không phải ngày cuối cùng
                            if (selectedDay === tourData.length - 1) {
                                setSelectedDay(selectedDay - 1); // Chuyển đến ngày trước đó
                            }
                            // Các trường hợp khác giữ nguyên selectedDay
                        }

                        // Tải lại dữ liệu từ server
                        if (onDataChange) {
                            onDataChange();
                        }
                    } else {
                        toast.error(response?.message || 'Có lỗi xảy ra, vui lòng thử lại sau', { autoClose: 3000 });
                    }
                } catch (error) {
                    console.error('Error removing day from itinerary:', error);
                    toast.error('Đã xảy ra lỗi, vui lòng thử lại sau', { autoClose: 3000 });
                }
            }
        });
    };

    const handleRemovePlace = async (itemId: number) => {        
        // Xử lý xóa địa điểm khỏi ngày được chọn
        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc muốn xóa địa điểm này khỏi lịch trình?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            cancelButtonColor: '#3085d6'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (!isTemplate) {
                        const response = await removePlaceFromItinerary(itemId);

                        if (response) {
                            toast.success('Đã xóa địa điểm khỏi lịch trình', { autoClose: 3000 });

                            // Tải lại dữ liệu từ server để đồng bộ hoàn toàn
                            if (onDataChange) {
                                onDataChange();
                            }
                        } else {
                            toast.error('Có lỗi xảy ra, vui lòng thử lại sau', { autoClose: 3000 });
                            // Nếu có lỗi, khôi phục dữ liệu
                            if (onDataChange) {
                                onDataChange();
                            }
                        }
                    } else {
                        // Nếu là template, chỉ xóa khỏi state và cập nhật sessionStorage
                        const updatedTourData = [...tourData]; // Tạo bản sao của tourData
                        const dayIndex = updatedTourData.findIndex(day => day === tourData[selectedDay]);
                        // Tạo bản sao của places và cập nhật
                        updatedTourData[dayIndex] = {
                            ...updatedTourData[dayIndex],
                            places: updatedTourData[dayIndex].places.filter(place => place.id !== itemId)
                        };

                        // // Lưu lại vào sessionStorage
                        sessionStorage.setItem('tourTemplates', JSON.stringify(updatedTourData));

                        // // Gọi onDataChange để cập nhật UI
                        if (onDataChange) {
                            onDataChange();
                        }

                        console.log('Updated tour data:', updatedTourData[dayIndex]);
                        

                        toast.success('Đã xóa địa điểm khỏi đề xuất', { autoClose: 3000 });
                    }
                } catch (error) {
                    console.error('Error removing place from itinerary:', error);
                    toast.error('Đã xảy ra lỗi, vui lòng thử lại sau', { autoClose: 3000 });
                    // Tải lại dữ liệu để đảm bảo mọi thứ đồng bộ
                    if (onDataChange) {
                        onDataChange();
                    }
                }
            }
        });
    }

    // Tính center cho bản đồ của ngày được chọn
    const mapCenter = useMemo(() => {
        if (selectedDayLocations.length === 0) {
            return { lat: 11.9438, lng: 108.4453 }; // Điểm mặc định (Đà Lạt)
        }

        const sum = selectedDayLocations.reduce(
            (acc, loc) => ({ lat: acc.lat + loc.lat, lng: acc.lng + loc.lng }),
            { lat: 0, lng: 0 }
        );

        return {
            lat: sum.lat / selectedDayLocations.length,
            lng: sum.lng / selectedDayLocations.length
        };
    }, [selectedDayLocations]);

    // Xử lý thay đổi tab ngày
    const handleDayChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedDay(newValue);
    };

    // Format thời gian để hiển thị
    // const formatDuration = (minutes: number) => {
    //     if (!minutes) return "N/A";

    //     const hours = Math.floor(minutes / 60);
    //     const mins = minutes % 60;

    //     if (hours > 0) {
    //         return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    //     }
    //     return `${mins}m`;
    // };

    return (
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <Grid container spacing={3}>
                {/* Left Section */}
                <Grid item xs={12} md={4}>
                    <CustomBox>
                        <Typography variant="h6" color="#f59e0b">
                            Lịch trình {planType}
                        </Typography>
                        <Image
                            src="/cinema-interior.jpg"
                            alt="Travel Plan"
                            layout="responsive"
                            width={500}
                            height={300}
                        />
                        <Typography>Số ngày: {tourData.length}</Typography>
                        <Typography>Tổng chi phí: {totalCost.toLocaleString()} VNĐ</Typography>
                        <Typography>Ước tính khoảng cách: ~{(totalPlaces * 0.5).toFixed(1)} km</Typography>
                        <Typography>Số địa điểm: {totalPlaces} địa điểm</Typography>
                    </CustomBox>
                </Grid>

                {/* Right Section */}
                <Grid item xs={12} md={8}>
                    {/* <CustomBox> */}
                        {/* Why choose us section - giữ nguyên */}
                        {/* <Typography variant="h6" color="#f59e0b">
                            Why choose us?
                        </Typography>
                        <ul className="list-disc pl-5 mt-2">
                            <li>More +300 places</li>
                            <li>The tourist attraction is unique</li>
                            <li>Low Rates & Savings</li>
                            <li>Bring the most privileged services</li>
                            <li>Excellent Support - Professional support staff</li>
                        </ul>
                        <Typography mt={2}>Do you need support?</Typography>
                        <Typography>You need support online please contact us.</Typography>
                        <Typography color="#007bff">02633822342</Typography> */}
                    {/* </CustomBox> */}

                    {/* Map Section with Day Tabs */}
                    <CustomBox>
                        <Typography variant="h6" color="#2e7d32" mb={2}>
                            Bản đồ hành trình
                        </Typography>

                        {/* Tabs để chọn ngày */}
                        <Tabs
                            value={selectedDay}
                            onChange={handleDayChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="day selection tabs"
                            sx={{ mb: 2 }}
                        >
                            {tourData.map((day, index) => (
                                <Tab
                                    key={index}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', pr: 4 }}>
                                            <span>{`Ngày ${day.day}`}</span>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Ngăn chặn việc chọn tab khi click vào nút xóa
                                                    if (!isTemplate) {
                                                        handleRemoveDay(day.day_id);
                                                    } else {
                                                        // Nếu là template, chỉ xóa khỏi state và cập nhật sessionStorage
                                                        const updatedTourData = [...tourData]; // Tạo bản sao của tourData
                                                        const dayIndex = updatedTourData.findIndex(d => d.day_id === day.day_id);
                                                        
                                                        if (dayIndex !== -1) {
                                                            // Xóa ngày khỏi danh sách
                                                            updatedTourData.splice(dayIndex, 1);
                                                            
                                                            // Cập nhật lại số thứ tự ngày cho các ngày còn lại
                                                            updatedTourData.forEach((d, idx) => {
                                                                d.day = idx + 1; // Cập nhật số ngày bắt đầu từ 1
                                                            });
                                                            
                                                            // Lưu lại vào sessionStorage
                                                            sessionStorage.setItem('tourTemplates', JSON.stringify(updatedTourData));
                                                            
                                                            // Điều chỉnh selectedDay nếu cần
                                                            if (selectedDay >= updatedTourData.length) {
                                                                setSelectedDay(Math.max(0, updatedTourData.length - 1));
                                                            }
                                                            
                                                            // Gọi onDataChange để cập nhật UI
                                                            if (onDataChange) {
                                                                onDataChange();
                                                            }
                                                            
                                                            toast.success('Đã xóa ngày khỏi đề xuất', { autoClose: 3000 });
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    right: -8,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'grey.500',
                                                    opacity: 0.7,
                                                    '&:hover': {
                                                        opacity: 1,
                                                        color: 'error.main',
                                                    },
                                                    ml: 1,
                                                    width: 24,
                                                    height: 24
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    }
                                    sx={{
                                        minWidth: 120,
                                        '&.Mui-selected': { color: '#f59e0b', fontWeight: 'bold' }
                                    }}
                                />
                            ))}
                        </Tabs>

                        {/* Hiển thị thông tin của ngày được chọn */}
                        {tourData[selectedDay] && (
                            <Box mb={2}>
                                <Typography variant="subtitle1">
                                    <strong>Ngày {tourData[selectedDay].day}</strong>: {tourData[selectedDay].places?.length || 0} địa điểm
                                </Typography>
                                <Typography variant="body2" color="error">
                                    Chi phí: {tourData[selectedDay].daily_cost?.toLocaleString() || 0} VNĐ
                                </Typography>
                            </Box>
                        )}

                        {/* Bản đồ của ngày được chọn */}
                        <MapContainerStyled>
                            <MapWithNoSSR
                                locations={selectedDayLocations}
                                center={mapCenter}
                                zoom={13}
                                showRoute={true} // Thêm prop này để MapComponent có thể vẽ route
                                dayNumber={tourData[selectedDay]?.day || 1} // Truyền số ngày để hiển thị trong title
                            />
                        </MapContainerStyled>
                    </CustomBox>

                    {/* Plan Detail - Hiển thị chỉ ngày được chọn */}
                    <PlanDetailContainer>
                        <Typography variant="h6" color="#2e7d32">
                            Chi tiết lịch trình ngày {tourData[selectedDay]?.day || 1}
                            {tourData[selectedDay]?.date && ` - ${tourData[selectedDay].date}`}
                        </Typography>

                        {tourData[selectedDay] && (
                            <Box mb={4}>
                                <Divider sx={{ my: 2 }} />
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Box>
                                        <Typography variant="h6">
                                            Ngày {tourData[selectedDay].day}
                                            {tourData[selectedDay].date && ` (${tourData[selectedDay].date})`}
                                        </Typography>
                                        <Typography>{tourData[selectedDay].places?.length || 0} địa điểm</Typography>
                                    </Box>
                                    <Typography color="error">Chi phí: {tourData[selectedDay].daily_cost?.toLocaleString() || 0} đ</Typography>
                                </Box>

                                {tourData[selectedDay].places?.map((place, placeIndex) => (
                                    <TimelineItem key={placeIndex}>
                                        <TimelineDot />
                                        <Box sx={{ width: '100%' }}>
                                            {/* Hiển thị thời gian đến/đi và thông tin thời gian */}
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle1" color="primary">
                                                    {place.arrival_time || '08:00'} - {place.departure_time || '10:00'}
                                                </Typography>
                                                {/* <Box>
                                                    <TimeItem>
                                                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                        Thời gian tham quan: {formatDuration(place.visitDurationMinutes)}
                                                    </TimeItem>
                                                    <TimeItem>
                                                        <DirectionsCarIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                        Thời gian di chuyển: {formatDuration(Math.round(place.travelTimeMinutes))}
                                                    </TimeItem>
                                                </Box> */}
                                            </Box>

                                            <Typography variant="h6">{place.name}</Typography>
                                            <Typography variant="body2">{place.address}</Typography>
                                            <Typography color="error">
                                                Người lớn: {place.adult_fare?.toLocaleString() || 0} đ |
                                                Trẻ em: {place.child_fare?.toLocaleString() || 0} đ |
                                                Tổng chi phí: {place.total_cost?.toLocaleString() || 0} đ
                                            </Typography>

                                            {/* Hiển thị hình ảnh nếu có */}
                                            {place.imageCode && (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/files/preview/${place.imageCode}`}
                                                    alt={place.name}
                                                    loading="lazy" // Thêm lazy loading
                                                    style={{ width: '150px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px' }}
                                                />
                                            )}

                                            {/* Hiển thị các hobbies */}
                                            {place.hobbies && place.hobbies.length > 0 && (
                                                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                                    {place.hobbies.map(hobby => (
                                                        <Typography
                                                            key={hobby.id}
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                bgcolor: '#e5f6fd',
                                                                color: '#0288d1',
                                                                px: 1,
                                                                py: 0.5,
                                                                borderRadius: 1
                                                            }}
                                                        >
                                                            {hobby.name}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>

                                        {/*  Hiển thị icon xóa */}
                                        <IconButton
                                            onClick={
                                                !isTemplate ? () => handleRemovePlace(place.item_id) : () => handleRemovePlace(place.id)
                                            }
                                            sx={{ position: 'absolute', top: 0, right: 0 }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TimelineItem>
                                ))}

                                {
                                    !isTemplate && (
                                        <Box display="flex" justifyContent="center" mt={3}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<AddCircle />}
                                                onClick={() => openAddPlaceDialog(tourData[selectedDay].day_id)}
                                                sx={{
                                                    borderStyle: 'dashed',
                                                    borderWidth: '2px',
                                                    '&:hover': {
                                                        borderStyle: 'dashed',
                                                        borderWidth: '2px',
                                                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                                    }
                                                }}
                                            >
                                                Thêm địa điểm
                                            </Button>
                                        </Box>
                                    )
                                }
                            </Box>
                        )}

                        {isTemplate && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSavePlanRecommend}
                                >
                                    Lưu lại
                                </Button>
                            </Box>
                        )}
                    </PlanDetailContainer>

                    <TimeSelectionDialog
                        open={isTimeDialogOpen}
                        onClose={() => setIsTimeDialogOpen(false)}
                        onConfirm={handleTimeConfirm}
                        initialVisitTime={selectedTimes.visitTime}
                        initialLeaveTime={selectedTimes.leaveTime}
                    />

                    <PlaceSelectionDialog
                        open={isPlaceDialogOpen}
                        onClose={() => setIsPlaceDialogOpen(false)}
                        onSelectPlace={handleAddPlaceToDay}
                    />
                </Grid>
            </Grid>
            <ToastContainer />
        </Box>
    );
};

export default TravelPlan;