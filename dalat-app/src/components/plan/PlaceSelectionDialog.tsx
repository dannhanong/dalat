import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, IconButton, TextField, Box, Typography,
    List, ListItem, ListItemText, ListItemAvatar, Avatar,
    Divider, CircularProgress, Grid, Slider, Checkbox, FormControlLabel,
    Accordion, AccordionSummary, AccordionDetails, Chip, FormGroup
} from '@mui/material';
import { 
    Close as CloseIcon, 
    Search as SearchIcon, 
    ExpandMore as ExpandMoreIcon,
    FilterAlt as FilterIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { getRecommend } from '@/services/place';
import { getCategories } from '@/services/category';
import { getUserLocation } from '@/services/utils';

type PlaceSelectionDialogProps = {
    open: boolean;
    onClose: () => void;
    onSelectPlace: (place: any) => void;
};

const PlaceSelectionDialog: React.FC<PlaceSelectionDialogProps> = ({ open, onClose, onSelectPlace }) => {
    // Trạng thái cho danh sách địa điểm
    const [places, setPlaces] = useState<any[]>([]);
    const [filteredPlaces, setFilteredPlaces] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Trạng thái cho các bộ lọc
    const [showFilters, setShowFilters] = useState(false);
    const [price, setPrice] = useState(100000000);
    const [isFree, setIsFree] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedHobbies, setSelectedHobbies] = useState<number[]>([]);
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [selectedMaxDistance, setSelectedMaxDistance] = useState<number>(5000);
    const [userLat, setUserLat] = useState<number>(11.90);
    const [userLon, setUserLon] = useState<number>(108.60);
    const [categories, setCategories] = useState<any[]>([]);

    // Danh sách sở thích cố định
    const hobbies = [
        { id: 1, name: "Khám phá thiên nhiên" },
        { id: 2, name: "Tham quan văn hóa & lịch sử" },
        { id: 3, name: "Thư giãn & giải trí" },
        { id: 4, name: "Thể thao & vận động" },
        { id: 5, name: "Mua sắm & ẩm thực" }
    ];

    // Lấy vị trí người dùng
    useEffect(() => {
        fetchMyLocation();
    }, []);

    // Tải danh sách danh mục
    useEffect(() => {
        fetchCategories();
    }, []);

    // Tải danh sách địa điểm khi mở dialog hoặc thay đổi bộ lọc
    useEffect(() => {
        if (open) {
            fetchPlaces();
        }
    }, [open, selectedCategories, selectedHobbies, selectedServices, price, selectedMaxDistance, searchQuery]);

    // Hàm lấy vị trí người dùng
    const fetchMyLocation = async () => {
        try {
            const location = await getUserLocation();
            if (location) {
                setUserLat(location.latitude);
                setUserLon(location.longitude);
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    };

    // Hàm lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            const response = await getCategories('', 0);
            setCategories(response.content);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Hàm lấy danh sách địa điểm
    const fetchPlaces = async () => {
        setIsLoading(true);
        try {
            const response = await getRecommend({
                user_id: null,
                user_lat: userLat,
                user_lon: userLon,
                max_distance: selectedMaxDistance,
                price: isFree ? 0 : price,
                top_n: 100, // Lấy nhiều hơn để có nhiều lựa chọn
                category_ids: selectedCategories,
                hobby_ids: selectedHobbies,
                service_ids: selectedServices,
                keyword: searchQuery
            }, 1);
            
            if (response && response.content) {
                setPlaces(response.content);
                setFilteredPlaces(response.content);
            } else {
                setPlaces([]);
                setFilteredPlaces([]);
            }
        } catch (error) {
            console.error('Error fetching places:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xử lý chọn địa điểm
    const handleSelectPlace = (place: any) => {
        onSelectPlace(place);
        onClose();
    };

    // Hàm cập nhật danh mục được chọn
    const handleCategoryChange = (categoryId: number) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    // Hàm cập nhật sở thích được chọn
    const handleHobbyChange = (hobbyId: number) => {
        setSelectedHobbies(prev => {
            if (prev.includes(hobbyId)) {
                return prev.filter(id => id !== hobbyId);
            } else {
                return [...prev, hobbyId];
            }
        });
    };

    // Hàm xử lý thay đổi khoảng cách tối đa
    const handleMaxDistanceChange = (event: Event, newValue: number | number[]) => {
        setSelectedMaxDistance(newValue as number);
    };

    // Hàm xử lý thay đổi giá
    const handlePriceChange = (event: Event, newValue: number | number[]) => {
        setPrice(newValue as number);
    };

    // Hàm xử lý toggle chọn miễn phí
    const handleFreeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsFree(event.target.checked);
    };

    // Hàm xóa tất cả bộ lọc
    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedHobbies([]);
        setSelectedServices([]);
        setSelectedMaxDistance(5000);
        setPrice(100000000);
        setIsFree(false);
        setSearchQuery('');
    };

    // Format giá tiền VND
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Render nội dung bộ lọc
    const renderFilters = () => (
        <Box p={2} bgcolor="#f8f8f8" borderRadius={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Bộ lọc</Typography>
                <Button startIcon={<ClearIcon />} onClick={clearAllFilters}>
                    Xóa tất cả
                </Button>
            </Box>
            
            {/* Bộ lọc chi phí */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="medium">Chi phí</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControlLabel
                        control={<Checkbox checked={isFree} onChange={handleFreeToggle} />}
                        label="Miễn phí"
                    />
                    <Box px={2}>
                        <Slider
                            disabled={isFree}
                            min={0}
                            max={500000}
                            step={10000}
                            value={price}
                            onChange={handlePriceChange}
                        />
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">0đ</Typography>
                            <Typography variant="body2">{formatPrice(price)}</Typography>
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Bộ lọc khoảng cách */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="medium">Khoảng cách tối đa</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box px={2}>
                        <Slider
                            min={0}
                            max={10000}
                            step={100}
                            value={selectedMaxDistance}
                            onChange={handleMaxDistanceChange}
                        />
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">0m</Typography>
                            <Typography variant="body2">{selectedMaxDistance}m</Typography>
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Bộ lọc danh mục */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="medium">Danh mục</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormGroup>
                        {categories.map((category) => (
                            <FormControlLabel
                                key={category.id}
                                control={
                                    <Checkbox
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => handleCategoryChange(category.id)}
                                    />
                                }
                                label={category.name}
                            />
                        ))}
                    </FormGroup>
                </AccordionDetails>
            </Accordion>

            {/* Bộ lọc sở thích */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="medium">Sở thích</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormGroup>
                        {hobbies.map((hobby) => (
                            <FormControlLabel
                                key={hobby.id}
                                control={
                                    <Checkbox
                                        checked={selectedHobbies.includes(hobby.id)}
                                        onChange={() => handleHobbyChange(hobby.id)}
                                    />
                                }
                                label={hobby.name}
                            />
                        ))}
                    </FormGroup>
                </AccordionDetails>
            </Accordion>
        </Box>
    );

    // Render các chip cho bộ lọc đã áp dụng
    const renderFilterChips = () => {
        const chips = [];

        // Chip cho miễn phí
        if (isFree) {
            chips.push(
                <Chip 
                    key="free" 
                    label="Miễn phí" 
                    onDelete={() => setIsFree(false)} 
                    sx={{ m: 0.5 }} 
                />
            );
        }

        // Chip cho giá
        if (!isFree && price < 100000000) {
            chips.push(
                <Chip 
                    key="price" 
                    label={`≤ ${formatPrice(price)}`} 
                    onDelete={() => setPrice(100000000)} 
                    sx={{ m: 0.5 }} 
                />
            );
        }

        // Chip cho khoảng cách
        if (selectedMaxDistance < 5000) {
            chips.push(
                <Chip 
                    key="distance" 
                    label={`≤ ${selectedMaxDistance}m`} 
                    onDelete={() => setSelectedMaxDistance(5000)} 
                    sx={{ m: 0.5 }} 
                />
            );
        }

        // Chip cho danh mục
        selectedCategories.forEach(catId => {
            const category = categories.find(c => c.id === catId);
            if (category) {
                chips.push(
                    <Chip 
                        key={`cat-${catId}`} 
                        label={category.name} 
                        onDelete={() => handleCategoryChange(catId)} 
                        sx={{ m: 0.5 }} 
                    />
                );
            }
        });

        // Chip cho sở thích
        selectedHobbies.forEach(hobbyId => {
            const hobby = hobbies.find(h => h.id === hobbyId);
            if (hobby) {
                chips.push(
                    <Chip 
                        key={`hobby-${hobbyId}`} 
                        label={hobby.name} 
                        onDelete={() => handleHobbyChange(hobbyId)} 
                        sx={{ m: 0.5 }} 
                    />
                );
            }
        });

        return chips.length > 0 ? (
            <Box p={1} display="flex" flexWrap="wrap">
                {chips}
            </Box>
        ) : null;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Chọn địa điểm</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <Box px={3} py={1} display="flex" gap={1}>
                <TextField
                    fullWidth
                    placeholder="Tìm kiếm địa điểm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                    }}
                />
                <Button 
                    variant={showFilters ? "contained" : "outlined"}
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    Lọc
                </Button>
            </Box>

            {renderFilterChips()}

            <DialogContent sx={{ display: 'flex', p: 0, height: '60vh' }}>
                {/* Phần bộ lọc */}
                {showFilters && (
                    <Box width="30%" sx={{ borderRight: '1px solid #e0e0e0', overflowY: 'auto' }}>
                        {renderFilters()}
                    </Box>
                )}
                
                {/* Phần danh sách địa điểm */}
                <Box width={showFilters ? "70%" : "100%"} sx={{ overflowY: 'auto', p: 2 }}>
                    {isLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress />
                        </Box>
                    ) : filteredPlaces.length > 0 ? (
                        <Grid container spacing={2}>
                            {filteredPlaces.map((place) => (
                                <Grid item xs={12} sm={6} md={showFilters ? 6 : 4} key={place.id}>
                                    <Box
                                        onClick={() => handleSelectPlace(place)}
                                        sx={{
                                            minHeight: 160,
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 1,
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                transition: 'all 0.2s'
                                            }
                                        }}
                                    >
                                        <Avatar
                                            src={place.image || '/images/placeholder.jpg'}
                                            alt={place.name}
                                            sx={{ width: 70, height: 70, mr: 2 }}
                                            variant="rounded"
                                        />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {place.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {place.address || 'Đà Lạt, Lâm Đồng'}
                                            </Typography>
                                            <Box display="flex" alignItems="center" mt={0.5}>
                                                <Typography variant="body2" color="text.secondary" mr={1}>
                                                    Giá: {place.adultFare ? formatPrice(place.adultFare) : 'Miễn phí'}
                                                </Typography>
                                                {place.distance && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        • {Math.round(place.distance)}m
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="text.secondary">Không tìm thấy địa điểm phù hợp</Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Hủy
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PlaceSelectionDialog;