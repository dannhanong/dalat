import { Place } from "@/models/Place";
import { isAuthenticated } from "@/services/auth";
import { addToWishlist } from "@/services/wishlist";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from 'react-toastify';
import { Card, CardContent, Typography, Box, IconButton, Button } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import Image from "next/image";

type AttractionProps = {
    attraction: Place;
    onWishlistChange?: () => void;
};

export default function AttractionCard({ attraction, onWishlistChange }: AttractionProps) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const imageUrl = `${baseUrl}/files/preview/${attraction.imageCode}`;
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(attraction.wishlisted);
    const router = useRouter(); 

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!isFavorite) {
            setIsFavorite(true);
            const response = await addToWishlist(attraction.id);        

            if (response) {
                toast.success("Đã thêm vào danh sách yêu thích", {
                    autoClose: 3000,
                });

                if (onWishlistChange) {
                    onWishlistChange();
                }
            } else {
                toast.error("Có lỗi xảy ra, vui lòng thử lại sau", {
                    autoClose: 3000,
                });
                setIsFavorite(false); // Revert if error
            }
        }
    };

    const formatPrice = (price: number) => {
        if (!price) return "Miễn phí";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleNavigate = () => {
        router.push(`/place/${attraction.id}`);
    };

    return (
        <Card 
            sx={{ 
                position: 'relative',
                cursor: 'pointer', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                },
                borderRadius: 2,
                overflow: 'hidden'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleNavigate}
        >
            {/* Image Section */}
            <Box sx={{ position: 'relative', height: 200 }}>
                <Image
                    src={imageUrl}
                    alt={attraction.name}
                    style={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                    }}
                    width={300}
                    height={200}
                />
                
                {/* Favorite Button */}
                {isAuthenticated() && (isHovered || isFavorite) && (
                    <IconButton 
                        onClick={handleFavoriteClick}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'white',
                            '&:hover': {
                                bgcolor: 'white',
                            },
                            boxShadow: 2,
                            zIndex: 10
                        }}
                        size="small"
                    >
                        {isFavorite ? (
                            <FavoriteIcon color="error" />
                        ) : (
                            <FavoriteBorderIcon sx={{ color: 'text.secondary' }} />
                        )}
                    </IconButton>
                )}

                {/* Hover Overlay */}
                {isHovered && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(2px)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 2,
                            zIndex: 5,
                            transition: 'opacity 0.3s',
                        }}
                    >
                        <Typography 
                            variant="subtitle1" 
                            color="white" 
                            fontWeight="bold"
                            sx={{ mb: 1 }}
                        >
                            {attraction.name}
                        </Typography>
                        
                        <Typography 
                            variant="body2" 
                            color="white" 
                            sx={{ 
                                mb: 2, 
                                textAlign: 'center',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {attraction.description || "Mô tả địa điểm"}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<EventIcon />}
                                sx={{ 
                                    bgcolor: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/plan?placeId=${attraction.id}`);
                                }}
                            >
                                Tạo lịch
                            </Button>
                            
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                sx={{ 
                                    bgcolor: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Thêm logic để thêm vào lịch hiện tại
                                    toast.info("Chức năng thêm vào lịch hiện tại đang phát triển");
                                }}
                            >
                                Thêm lịch
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
            
            {/* Content Section */}
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h6" component="div" fontWeight="bold" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {attraction.name}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mt={0.5} mb={1}>
                        <LocationOnIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.secondary" sx={{
                            ml: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                        }}>
                            {attraction.address || "Đà Lạt, Lâm Đồng"}
                        </Typography>
                    </Box>
                </Box>

                {/* Categories */}
                {/* {attraction.categories && attraction.categories.length > 0 && (
                    <Box display="flex" flexWrap="wrap" my={1}>
                        {attraction.categories.slice(0, 2).map((category, index) => (
                            <Chip 
                                key={index} 
                                label={category.name} 
                                size="small" 
                                sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                        ))}
                    </Box>
                )} */}

                {/* Price and Distance */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="body1" color="primary" fontWeight="bold">
                        {formatPrice(attraction.childFare || 0)} - {formatPrice(attraction.adultFare || 0)}
                    </Typography>
                    {/* {attraction.distance && (
                        <Typography variant="body2" color="text.secondary">
                            {Math.round(attraction.distance)}m
                        </Typography>
                    )} */}
                </Box>
            </CardContent>
        </Card>
    );
}