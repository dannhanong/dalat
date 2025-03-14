"use client";

import { getCategories } from "@/services/category";
import { getServicesByCategoryId } from "@/services/place";
import { useEffect, useState } from "react";
import {
    Typography, Box, Slider, Checkbox, FormControlLabel, FormGroup,
    Accordion, AccordionSummary, AccordionDetails, Chip, Button
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    FilterAlt as FilterIcon,
    Clear as ClearIcon,
} from "@mui/icons-material";

type FilterSidebarProps = {
    setPrice: (price: number) => void;
    setSelectedCategories: (categories: number[]) => void;
    setSelectedHobbies: (hobbies: number[]) => void;
    setSelectedServices: (services: number[]) => void;
    setSelectedMaxDistance: (distance: number) => void;
};

export default function FilterSidebar({
    setPrice,
    setSelectedCategories,
    setSelectedHobbies,
    setSelectedServices,
    setSelectedMaxDistance
}: FilterSidebarProps) {
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [selectedCategories, updateSelectedCategories] = useState<number[]>([]);
    const [selectedHobbies, updateSelectedHobbies] = useState<number[]>([]);
    const [isFree, setIsFree] = useState(false);
    const [maxPrice, setMaxPrice] = useState<number>(100000000);
    const [services, setServices] = useState<{ id: number; name: string; categoryId: number }[]>([]);
    const [maxDistance, setMaxDistance] = useState<number>(5000);

    const [, setCategoryServices] = useState<Record<number, { id: number; name: string }[]>>({});
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

    // Danh sách sở thích cố định
    const hobbies = [
        { id: 1, name: "Khám phá thiên nhiên" },
        { id: 2, name: "Tham quan văn hóa & lịch sử" },
        { id: 3, name: "Thư giãn & giải trí" },
        { id: 4, name: "Thể thao & vận động" },
        { id: 5, name: "Mua sắm & ẩm thực" }
    ];

    const handleCategoryServices = async (categoryId: number, isChecked: boolean) => {
        try {
            if (isChecked) {
                // Nếu chọn category, lấy services và thêm vào
                const response = await getServicesByCategoryId(categoryId);
                const servicesWithCategory = response.map((service: { id: number; name: string;}) => ({
                    ...service,
                    categoryId: categoryId // Thêm thông tin này để dễ lọc sau này
                }));

                // Cập nhật state lưu trữ services theo category
                setCategoryServices(prev => ({
                    ...prev,
                    [categoryId]: response.content
                }));

                // Thêm services của category vào danh sách hiển thị
                setServices(prevServices => [...prevServices, ...servicesWithCategory]);
            } else {
                // Nếu bỏ chọn category, loại bỏ services của category đó
                setServices(prevServices =>
                    prevServices.filter(service => service.categoryId !== categoryId)
                );

                // Xóa services của category khỏi state lưu trữ
                setCategoryServices(prev => {
                    const newState = { ...prev };
                    delete newState[categoryId];
                    return newState;
                });
            }
        } catch (error) {
            console.error("Error handling category services:", error);
        }
    };

    const handleFreeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsFree(event.target.checked);
    };

    const handlePriceChange = (event: Event, newValue: number | number[]) => {
        setMaxPrice(newValue as number);
    };

    const handleDistanceChange = (event: Event, newValue: number | number[]) => {
        setMaxDistance(newValue as number);
    };

    const handleCategoryChange = (categoryId: number) => {
        const isChecked = !selectedCategories.includes(categoryId);
        if (isChecked) {
            updateSelectedCategories((prev) => [...prev, categoryId]);
        } else {
            updateSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
        }
        handleCategoryServices(categoryId, isChecked);
    };

    const handleHobbyChange = (hobbyId: number) => {
        if (selectedHobbies.includes(hobbyId)) {
            updateSelectedHobbies((prev) => prev.filter((id) => id !== hobbyId));
        } else {
            updateSelectedHobbies((prev) => [...prev, hobbyId]);
        }
    };

    const handleServiceChange = (serviceId: number) => {
        if (selectedServiceIds.includes(serviceId)) {
            setSelectedServiceIds(prev => prev.filter(id => id !== serviceId));
        } else {
            setSelectedServiceIds(prev => [...prev, serviceId]);
        }
    };

    // Xóa tất cả bộ lọc
    const clearAllFilters = () => {
        updateSelectedCategories([]);
        updateSelectedHobbies([]);
        setSelectedServiceIds([]);
        setMaxDistance(5000);
        setMaxPrice(100000000);
        setIsFree(false);
        setServices([]);
    };

    // Format giá tiền VND
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const fetchCategories = async () => {
        try {
            const response = await getCategories('', 0);
            setCategories(response.content || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setPrice(isFree ? 0 : maxPrice);
    }, [isFree, maxPrice, setPrice]);

    useEffect(() => {
        setSelectedCategories(selectedCategories);
    }, [selectedCategories, setSelectedCategories]);

    useEffect(() => {
        setSelectedHobbies(selectedHobbies);
    }, [selectedHobbies, setSelectedHobbies]);

    useEffect(() => {
        setSelectedServices(selectedServiceIds);
    }, [selectedServiceIds, setSelectedServices]);

    useEffect(() => {
        setSelectedMaxDistance(maxDistance);
    }, [maxDistance, setSelectedMaxDistance]);

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
                    size="small"
                    sx={{ m: 0.5 }} 
                />
            );
        }

        // Chip cho giá
        if (!isFree && maxPrice < 100000000) {
            chips.push(
                <Chip 
                    key="price" 
                    label={`≤ ${formatPrice(maxPrice)}`} 
                    onDelete={() => setMaxPrice(100000000)} 
                    size="small"
                    sx={{ m: 0.5 }} 
                />
            );
        }

        // Chip cho khoảng cách
        if (maxDistance < 5000) {
            chips.push(
                <Chip 
                    key="distance" 
                    label={`≤ ${maxDistance}m`} 
                    onDelete={() => setMaxDistance(5000)} 
                    size="small"
                    sx={{ m: 0.5 }} 
                />
            );
        }

        // Chip cho danh mục
        selectedCategories.forEach(catId => {
            const category = categories.find(c => parseInt(c.id) === catId);
            if (category) {
                chips.push(
                    <Chip 
                        key={`cat-${catId}`} 
                        label={category.name} 
                        onDelete={() => handleCategoryChange(catId)} 
                        size="small"
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
                        size="small"
                        sx={{ m: 0.5 }} 
                    />
                );
            }
        });

        // Chip cho dịch vụ
        selectedServiceIds.forEach(serviceId => {
            const service = services.find(s => s.id === serviceId);
            if (service) {
                chips.push(
                    <Chip 
                        key={`service-${serviceId}`} 
                        label={service.name} 
                        onDelete={() => handleServiceChange(serviceId)} 
                        size="small"
                        sx={{ m: 0.5 }} 
                    />
                );
            }
        });

        return chips;
    };

    return (
        <Box 
            component="div" 
            className="w-1/4 bg-white p-4 shadow-lg mb-2" 
            sx={{ 
                minHeight: "88vh", 
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                    <FilterIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Bộ lọc</Typography>
                </Box>
                <Button 
                    startIcon={<ClearIcon />} 
                    color="primary"
                    size="small"
                    onClick={clearAllFilters}
                >
                    Xóa tất cả
                </Button>
            </Box>

            {renderFilterChips().length > 0 && (
                <Box display="flex" flexWrap="wrap" mb={1} pb={1} borderBottom="1px solid #e0e0e0">
                    {renderFilterChips()}
                </Box>
            )}

            {/* Bộ lọc chi phí */}
            <Accordion defaultExpanded elevation={0} sx={{ 
                '&:before': { display: 'none' },
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 2
            }}>
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ backgroundColor: '#f5f5f5' }}
                >
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
                            value={maxPrice}
                            onChange={handlePriceChange}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => formatPrice(value)}
                        />
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">0đ</Typography>
                            <Typography variant="body2">{formatPrice(maxPrice)}</Typography>
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Bộ lọc khoảng cách */}
            <Accordion defaultExpanded elevation={0} sx={{ 
                '&:before': { display: 'none' },
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 2
            }}>
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ backgroundColor: '#f5f5f5' }}
                >
                    <Typography fontWeight="medium">Khoảng cách tối đa</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box px={2}>
                        <Slider
                            min={1000}
                            max={10000}
                            step={1000}
                            value={maxDistance}
                            onChange={handleDistanceChange}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value/1000} km`}
                            marks={[
                                { value: 1000, label: '1 km' },
                                { value: 5000, label: '5 km' },
                                { value: 10000, label: '10 km' },
                            ]}
                        />
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Bộ lọc danh mục */}
            <Accordion defaultExpanded elevation={0} sx={{ 
                '&:before': { display: 'none' },
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 2
            }}>
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ backgroundColor: '#f5f5f5' }}
                >
                    <Typography fontWeight="medium">Danh mục</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormGroup>
                        {categories.map((category) => (
                            <FormControlLabel
                                key={category.id}
                                control={
                                    <Checkbox
                                        checked={selectedCategories.includes(parseInt(category.id))}
                                        onChange={() => handleCategoryChange(parseInt(category.id))}
                                    />
                                }
                                label={category.name}
                            />
                        ))}
                    </FormGroup>
                </AccordionDetails>
            </Accordion>

            {/* Bộ lọc đặc điểm */}
            <Accordion defaultExpanded elevation={0} sx={{ 
                '&:before': { display: 'none' },
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 2
            }}>
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ backgroundColor: '#f5f5f5' }}
                >
                    <Typography fontWeight="medium">Đặc điểm</Typography>
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

            {/* Bộ lọc dịch vụ */}
            {services.length > 0 && (
                <Accordion defaultExpanded elevation={0} sx={{ 
                    '&:before': { display: 'none' },
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 2
                }}>
                    <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ backgroundColor: '#f5f5f5' }}
                    >
                        <Typography fontWeight="medium">Dịch vụ</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FormGroup>
                            {services.map((service) => (
                                <FormControlLabel
                                    key={service.id}
                                    control={
                                        <Checkbox
                                            checked={selectedServiceIds.includes(service.id)}
                                            onChange={() => handleServiceChange(service.id)}
                                        />
                                    }
                                    label={service.name}
                                />
                            ))}
                        </FormGroup>
                    </AccordionDetails>
                </Accordion>
            )}
        </Box>
    );
}