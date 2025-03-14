"use client";

import { getCategories } from '@/services/category';
import { getServicesByCategoryId } from '@/services/place';
import React, { useEffect, useState } from 'react';
import ItineraryDialog from './ItineraryDialog';
import { createItinerary } from '@/services/itinerary';
import { useToast } from '@/hooks/useToast';
import { toast } from 'react-toastify';
import {
  Typography, Box, Slider, Checkbox, FormControlLabel, FormGroup,
  Accordion, AccordionSummary, AccordionDetails, Chip, Button,
  TextField,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  People as PeopleIcon,
  ChildCare as ChildIcon
} from "@mui/icons-material";

type FilterSidebarProps = {
  setPrice: (price: number) => void;
  setSelectedCategories: (categories: number[]) => void;
  setSelectedHobbies: (hobbies: number[]) => void;
  setSelectedDurationChange: (duration: number) => void;
  setSelectedServices: (services: number[]) => void;
  setSelectedMaxDistance: (maxDistance: number) => void;
  setNumAdults?: (adults: number) => void;
  setNumChildren?: (children: number) => void;
};

const TourFilter: React.FC<FilterSidebarProps> = ({ 
  setPrice, 
  setSelectedCategories, 
  setSelectedHobbies, 
  setSelectedDurationChange,
  setSelectedServices,
  setSelectedMaxDistance,
  setNumAdults = () => {},
  setNumChildren = () => {}
}) => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategories, updateSelectedCategories] = useState<number[]>([]);
  const [selectedHobbies, updateSelectedHobbies] = useState<number[]>([]);
  const [isFree, setIsFree] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(100000000);
  const [, setCategoryServices] = useState<Record<number, { id: number; name: string }[]>>({});
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [services, setServices] = useState<{ id: number; name: string; categoryId: number }[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(5000);
  const [duration, setDuration] = useState<number>(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const { showToast } = useToast();

  // Danh sách sở thích cố định
  const hobbies = [
    { id: 1, name: "Khám phá thiên nhiên" },
    { id: 2, name: "Tham quan văn hóa & lịch sử" },
    { id: 3, name: "Thư giãn & giải trí" },
    { id: 4, name: "Thể thao & vận động" },
    { id: 5, name: "Mua sắm & ẩm thực" }
  ];

  const handleDistanceChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setMaxDistance(value);
  };

  const handleCreateTravelRecommend = () => {
    console.log("Mở dialog tạo hành trình");
    // Không cần gọi API recommend nữa
    setIsDialogOpen(true);
  };

  const handleSubmitItinerary = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await createItinerary(data);
      
      if (response && response.success) {
        showToast({
          type: "success",
          message: "Tạo hành trình thành công!"
        });
        setIsDialogOpen(false);
        
        toast.success("Tạo hành trình thành công!");
      } else {
        showToast({
          type: "error",
          message: response.message || "Không thể tạo hành trình. Vui lòng thử lại!"
        });
      }
    } catch (error) {
      console.error("Error creating itinerary:", error);
      showToast({
        type: "error",
        message: "Đã xảy ra lỗi khi tạo hành trình!"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryServices = async (categoryId: number, isChecked: boolean) => {
    try {
      if (isChecked) {
        // Nếu chọn category, lấy services và thêm vào
        const response = await getServicesByCategoryId(categoryId);
        const servicesWithCategory = response.map((service: {id: number; name: string}) => ({
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

  const handleChangeSelectedDuration = (event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setSelectedDurationChange(value);
    setDuration(value);
  };

  const handleFreeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsFree(event.target.checked);
    if (event.target.checked) setMaxPrice(0);
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setMaxPrice(value);
    setPrice(value);
    if (value > 0) {
      setIsFree(false);
    }
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

  const handleAdultsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setAdults(value);
    setNumAdults(value);
  };

  const handleChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    setChildren(value);
    setNumChildren(value);
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
    setDuration(1);
    setAdults(2);
    setChildren(0);
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

  useEffect(() => {
    setSelectedDurationChange(duration);
  }, [duration, setSelectedDurationChange]);

  useEffect(() => {
    setNumAdults(adults);
  }, [adults, setNumAdults]);

  useEffect(() => {
    setNumChildren(children);
  }, [children, setNumChildren]);

  // Render các chip cho bộ lọc đã áp dụng
  const renderFilterChips = () => {
    const chips = [];

    // Chip cho số ngày
    if (duration > 1) {
      chips.push(
        <Chip 
          key="duration" 
          label={`${duration} ngày`} 
          onDelete={() => {
            setDuration(1);
            setSelectedDurationChange(1);
          }} 
          size="small"
          sx={{ m: 0.5 }} 
        />
      );
    }

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
          label={`≤ ${maxDistance/1000} km`} 
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
      sx={{ 
        width: '25%',
        bgcolor: 'white',
        p: 3,
        boxShadow: 2,
        mb: 2,
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

      {/* Bộ lọc thông tin du lịch */}
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
          <Typography fontWeight="medium">Thông tin du lịch</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Số ngày du lịch</Typography>
            <Slider
              min={1}
              max={7}
              step={1}
              value={duration}
              onChange={handleChangeSelectedDuration}
              valueLabelDisplay="auto"
              marks={[
                { value: 1, label: '1' },
                { value: 3, label: '3' },
                { value: 5, label: '5' },
                { value: 7, label: '7' }
              ]}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" gutterBottom>Số lượng người</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <TextField
                label="Người lớn"
                type="number"
                value={adults}
                onChange={handleAdultsChange}
                InputProps={{
                  inputProps: { min: 1 }
                }}
                size="small"
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ChildIcon sx={{ mr: 1, color: 'primary.main' }} />
              <TextField
                label="Trẻ em"
                type="number"
                value={children}
                onChange={handleChildrenChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                size="small"
                fullWidth
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

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
              max={10000000}
              step={100000}
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

      {/* Nút tạo lịch trình */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleCreateTravelRecommend}
        disabled={isLoading}
        sx={{ 
          mt: 'auto', 
          py: 1.5,
          fontSize: '1rem',
          boxShadow: 3
        }}
      >
        {isLoading ? "Đang tải..." : "Tạo lịch trình"}
      </Button>

      <ItineraryDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmitItinerary}
        duration={duration}
      />
    </Box>
  );
};

export default TourFilter;