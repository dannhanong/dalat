'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Place } from '@/models/Place';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getPlaceById, getRecommend } from '@/services/place';
import AttractionCard from '@/components/home/AttractionCard';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Avatar, Rating, Divider, Paper, Stack, Pagination, TextField, Button } from '@mui/material';
import { getUserLocation } from '@/services/utils';
import { createFeedback, getFeedbacks } from '@/services/feedback';
import { format } from 'date-fns'; // Cần cài đặt: npm install date-fns
import { isAuthenticated } from '@/services/auth';

export default function PlaceDetail() {
    const { id } = useParams();
    const [place, setPlace] = useState<Place | null>(null);
    const [loading, setLoading] = useState(true);
    const [similarPlaces, setSimilarPlaces] = useState<Place[]>([]);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const [userLat, setUserLat] = useState<number>(11.90);
    const [userLon, setUserLon] = useState<number>(108.60);
    const [feedbacks, setFeedbacks] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [userRating, setUserRating] = useState<number | null>(0);
    const [userComment, setUserComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchMyLocation = async () => {
        const location = await getUserLocation();
        if (location) {
            setUserLat(location.latitude);
            setUserLon(location.longitude);
        }
    };

    const fetchPlaceFeedbacks = async () => {
        try {
            if (id) {
                const placeId = Array.isArray(id) ? id[0] : id;
                const data = await getFeedbacks(parseInt(placeId), currentPage);
                setFeedbacks(data.content);
                setTotalPages(data.page.totalPages);
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        }
    }

    useEffect(() => {
        fetchPlaceFeedbacks();
    }, [id, currentPage]);

    useEffect(() => {
        const fetchPlaceDetails = async () => {
            try {
                if (id) {
                    const placeId = Array.isArray(id) ? id[0] : id;
                    const data = await getPlaceById(parseInt(placeId));
                    setPlace(data);

                    const similarData = await getRecommend(
                        {
                            user_id: null,
                            user_lat: userLat,
                            user_lon: userLon,
                            max_distance: 10000,
                            price: 60000,
                            top_n: 5,
                            category_ids: [data.category.id],
                            hobby_ids: [],
                            service_ids: [],
                            keyword: '',
                        },
                        1
                    );

                    const filteredPlaces = similarData.content.filter(
                        (similarPlace: { id: number }) => similarPlace.id !== parseInt(placeId)
                    );
                    setSimilarPlaces(filteredPlaces);
                }
            } catch (error) {
                console.error('Error fetching place details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaceDetails();
    }, [id]);

    useEffect(() => {
        fetchMyLocation();
    }, []);

    const handleSubmitReview = async () => {
        if (!userRating) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        try {
            setSubmitting(true);
            
            const placeId = Array.isArray(id) ? id[0] : id;
            
            await createFeedback({
                placeId: placeId,
                rating: userRating,
                comment: userComment
            });
            
            toast.success('Gửi đánh giá thành công!');
            setUserRating(0);
            setUserComment('');
            
            // Refresh feedback list
            fetchPlaceFeedbacks();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress color="primary" />
                <Typography variant="body1" sx={{ ml: 2 }}>Đang tải thông tin...</Typography>
            </Box>
        );
    }

    if (!place) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h5" color="error">
                    Không tìm thấy địa điểm
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                {/* Hình ảnh chính */}
                <Box sx={{ position: 'relative', height: { xs: 300, md: 500 } }}>
                    <Image
                        src={`${baseUrl}/files/preview/${place.imageCode}`}
                        alt={place.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Hình ảnh phụ */}
                    {place.otherImages?.length > 0 && (
                        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {place.otherImages.map((image, index) => (
                                <Image
                                    key={index}
                                    src={`${baseUrl}/files/preview/${image}`}
                                    alt={`${place.name} - ${index}`}
                                    width={120}
                                    height={120}
                                    className="rounded-lg shadow-md object-cover"
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Thông tin địa điểm */}
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {place.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        {place.address}
                    </Typography>

                    {/* Danh mục */}
                    <Box sx={{ my: 2 }}>
                        <Typography variant="h6" fontWeight="medium">
                            Danh mục:
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                                {place.category.name}
                            </span>
                        </Box>
                    </Box>

                    {/* Mô tả */}
                    <Box sx={{ my: 2 }}>
                        <Typography variant="h6" fontWeight="medium">
                            Mô tả:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {place.description}
                        </Typography>
                    </Box>

                    {/* Thông tin khác */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" fontWeight="medium">
                                Giờ mở cửa:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {place.openTime || 'Không có thông tin'} - {place.closeTime || 'Không có thông tin'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {place.category.name === 'Ăn uống' ? (
                                <>
                                    <Typography variant="h6" fontWeight="medium">
                                        Giá trung bình:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {place.childFare?.toLocaleString('vi-VN') || 'Không có thông tin'} VNĐ -{' '}
                                        {place.adultFare?.toLocaleString('vi-VN') || 'Không có thông tin'} VNĐ
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h6" fontWeight="medium">
                                        Giá vé:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Người lớn: {place.adultFare?.toLocaleString('vi-VN') || 'Không có thông tin'} VNĐ
                                        <br />
                                        Trẻ em: {place.childFare?.toLocaleString('vi-VN') || 'Không có thông tin'} VNĐ
                                    </Typography>
                                </>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>

                {/* Gợi ý địa điểm tương tự */}
                <Box sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Gợi ý những địa điểm tương tự
                    </Typography>
                    {similarPlaces.length > 0 ? (
                        <Grid container spacing={2}>
                            {similarPlaces.slice(0, 4).map((similarPlace, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <AttractionCard attraction={similarPlace} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography variant="body1" color="text.secondary">
                            Không tìm thấy địa điểm tương tự.
                        </Typography>
                    )}
                </Box>
            </Card>

            {/* Phản hồi và đánh giá của người dùng */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Đánh giá từ khách tham quan
                </Typography>
                
                {/* Thêm form đánh giá mới */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f0f7ff', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                        Chia sẻ trải nghiệm của bạn
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ mr: 2 }}>
                            Đánh giá:
                        </Typography>
                        <Rating
                            name="user-rating"
                            value={userRating}
                            onChange={(event, newValue) => {
                                setUserRating(newValue);
                            }}
                            precision={1}
                            size="large"
                        />
                    </Box>
                    
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn về địa điểm này..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleSubmitReview}
                        disabled={submitting || !userRating}
                        sx={{ px: 4 }}
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                    
                    {!isAuthenticated() && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            * Bạn cần đăng nhập để gửi đánh giá
                        </Typography>
                    )}
                </Paper>

                {feedbacks.length > 0 ? (
                    <Box sx={{ mt: 2 }}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    {feedbacks.length} đánh giá
                                </Typography>
                                
                                {/* Hiển thị rating trung bình */}
                                {/* <Box display="flex" alignItems="center">
                                    <Rating
                                        value={place.rating || 0}
                                        precision={0.5}
                                        readOnly
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="h6" fontWeight="medium">
                                        {place.rating ? place.rating.toFixed(1) : "0.0"}/5
                                    </Typography>
                                </Box> */}
                            </Box>

                            {/* Danh sách đánh giá */}
                            <Stack spacing={3}>
                                {feedbacks.map((feedback: any) => (
                                    <Box key={feedback.id} sx={{ mb: 3 }}>
                                        <Box display="flex" alignItems="center" mb={1.5}>
                                            <Avatar 
                                                src={feedback.user.avatarCode ? 
                                                    `${baseUrl}/files/preview/${feedback.user.avatarCode}` : 
                                                    undefined
                                                }
                                                alt={feedback.user.name}
                                                sx={{ width: 48, height: 48, mr: 2 }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    {feedback.user.name}
                                                </Typography>
                                                <Box display="flex" alignItems="center">
                                                    <Rating 
                                                        value={feedback.rating} 
                                                        readOnly 
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {feedback.createdAt && format(
                                                            new Date(feedback.createdAt),
                                                            "dd/MM/yyyy HH:mm"
                                                        )}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box sx={{ pl: 8 }}>
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {feedback.comment}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ mt: 3 }} />
                                    </Box>
                                ))}
                            </Stack>

                            {/* Phân trang */}
                            <Box display="flex" justifyContent="center" mt={4}>
                                <Pagination
                                    count={totalPages} // Thay đổi thành số trang thực tế từ API
                                    page={currentPage + 1}
                                    onChange={(e, page) => setCurrentPage(page - 1)}
                                    color="primary"
                                />
                            </Box>
                        </Paper>
                    </Box>
                ) : (
                    <Box sx={{ my: 3, p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                            Chưa có đánh giá nào cho địa điểm này.
                        </Typography>
                    </Box>
                )}
            </Box>

            <ToastContainer />
        </Box>
    );
}