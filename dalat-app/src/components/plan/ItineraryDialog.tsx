import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Box, Typography, Grid, Divider, Avatar } from '@mui/material';
import { Close as CloseIcon, AddCircle, RemoveCircle, Add, Delete } from '@mui/icons-material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import PlaceSelectionDialog from './PlaceSelectionDialog';
import { toast } from 'react-toastify';

type ItineraryDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  duration: number;
}

const ItineraryDialog: React.FC<ItineraryDialogProps> = ({ open, onClose, onSubmit, duration: initialDuration }) => {
  const today = dayjs();
  const [title, setTitle] = useState(`Chuyến du lịch Đà Lạt ${initialDuration} ngày`);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today.add(initialDuration - 1, 'day'));
  const [totalAdults, setTotalAdults] = useState(2);
  const [totalChildren, setTotalChildren] = useState(0);
  const [days, setDays] = useState<any[]>([]);
  const [duration, setDuration] = useState(initialDuration);
  const [isPlaceDialogOpen, setIsPlaceDialogOpen] = useState(false);
  const [currentEditingPlace, setCurrentEditingPlace] = useState<{dayIndex: number, itemIndex: number} | null>(null);

  // Tính toán số ngày dựa trên ngày bắt đầu và kết thúc
  useEffect(() => {
    if (startDate && endDate) {
      const diff = endDate.diff(startDate, 'day') + 1;
      if (diff > 0) {
        setDuration(diff);
      }
    }
  }, [startDate, endDate]);

  // Khởi tạo các ngày trong lịch trình khi dialog mở hoặc khi thay đổi ngày
  useEffect(() => {
    if (open && startDate && endDate) {
      const diff = endDate.diff(startDate, 'day') + 1;
      if (diff > 0) {
        const newDays = [];
        for (let i = 0; i < diff; i++) {
          const currentDate = startDate.add(i, 'day');
          // Giữ lại các địa điểm cũ nếu có
          const existingDay = days.find(d => d.dayNumber === (i + 1));
          newDays.push({
            dayNumber: i + 1,
            date: currentDate.format('YYYY-MM-DD'),
            items: existingDay?.items || []
          });
        }
        setDays(newDays);
        // Cập nhật tiêu đề hành trình
        setTitle(`Chuyến du lịch Đà Lạt ${diff} ngày`);
      }
    }
  }, [open, startDate, endDate, duration]);

  const handleStartDateChange = (newDate: any) => {
    if (newDate) {
      setStartDate(newDate);
      
      // Nếu ngày bắt đầu mới sau ngày kết thúc hiện tại, cập nhật ngày kết thúc
      if (newDate.isAfter(endDate)) {
        setEndDate(newDate.add(duration - 1, 'day'));
      }
    }
  };

  const handleEndDateChange = (newDate: any) => {
    if (newDate) {
      // Chỉ cho phép ngày kết thúc sau hoặc bằng ngày bắt đầu
      if (newDate.isBefore(startDate)) {
        return;
      }
      
      setEndDate(newDate);
    }
  };

  const handleAdultsChange = (action: 'add' | 'remove') => {
    if (action === 'add') {
      setTotalAdults(prev => prev + 1);
    } else if (totalAdults > 1) {
      setTotalAdults(prev => prev - 1);
    }
  };

  const handleChildrenChange = (action: 'add' | 'remove') => {
    if (action === 'add') {
      setTotalChildren(prev => prev + 1);
    } else if (totalChildren > 0) {
      setTotalChildren(prev => prev - 1);
    }
  };

  const addPlaceToDay = (dayIndex: number) => {
    const newDays = [...days];
    const day = newDays[dayIndex];
    
    // Default times
    const defaultVisitTime = dayjs(`${day.date}T08:00:00`).add(day.items.length * 2, 'hour');
    
    day.items.push({
      placeId: '', // Empty ID, to be filled by user
      visitTime: defaultVisitTime.format('YYYY-MM-DDTHH:mm:00'),
      departureTime: defaultVisitTime.add(2, 'hour').format('YYYY-MM-DDTHH:mm:00')
    });
    
    setDays(newDays);
  };

  const removePlaceFromDay = (dayIndex: number, placeIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].items.splice(placeIndex, 1);
    setDays(newDays);
  };

  const updatePlace = (dayIndex: number, placeIndex: number, field: string, value: any) => {
    const newDays = [...days];
    newDays[dayIndex].items[placeIndex][field] = value;
    setDays(newDays);
  };

  const openPlaceSelectionDialog = (dayIndex: number, itemIndex: number) => {
    setCurrentEditingPlace({ dayIndex, itemIndex });
    setIsPlaceDialogOpen(true);
  };
  
  const handleSelectPlace = (place: any) => {
    if (currentEditingPlace) {
      const { dayIndex, itemIndex } = currentEditingPlace;
      updatePlace(dayIndex, itemIndex, 'placeId', place.id.toString());
      updatePlace(dayIndex, itemIndex, 'placeName', place.name); // Lưu tên địa điểm để hiển thị
      updatePlace(dayIndex, itemIndex, 'placeImage', place.image); // Lưu hình ảnh (nếu có)
    }
    setIsPlaceDialogOpen(false);
  };

  const handleSubmit = () => {
    // Kiểm tra dữ liệu trước khi gửi
    const validDays = days.filter(day => day.items.some(item => item.placeId));
    
    if (validDays.length === 0) {
      toast.error("Vui lòng thêm ít nhất một địa điểm vào lịch trình.");
      return;
    }
    
    const data = {
      title,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      totalAdults,
      totalChildren,
      days: days.map(day => ({
        ...day,
        items: day.items.filter(item => item.placeId) // Chỉ gửi các item có placeId
      }))
    };

    onSubmit(data);
    console.log("Submitted data:", data);
    
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Tạo hành trình mới</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box mb={3}>
            <TextField
              label="Tên hành trình"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Box>
          
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Ngày bắt đầu"
                value={startDate}
                onChange={handleStartDateChange}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Ngày kết thúc"
                value={endDate}
                onChange={handleEndDateChange}
                minDate={startDate}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
          
          <Box mb={2} bgcolor="#f5f5f5" p={2} borderRadius={1}>
            <Typography variant="body1">
              Số ngày: {duration} ngày
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Số lượng du khách
          </Typography>
          
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" justifyContent="space-between" border="1px solid #ddd" borderRadius={1} p={1}>
                <Typography>Người lớn</Typography>
                <Box display="flex" alignItems="center">
                  <IconButton size="small" onClick={() => handleAdultsChange('remove')}>
                    <RemoveCircle />
                  </IconButton>
                  <Typography mx={1}>{totalAdults}</Typography>
                  <IconButton size="small" onClick={() => handleAdultsChange('add')}>
                    <AddCircle />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" justifyContent="space-between" border="1px solid #ddd" borderRadius={1} p={1}>
                <Typography>Trẻ em</Typography>
                <Box display="flex" alignItems="center">
                  <IconButton size="small" onClick={() => handleChildrenChange('remove')}>
                    <RemoveCircle />
                  </IconButton>
                  <Typography mx={1}>{totalChildren}</Typography>
                  <IconButton size="small" onClick={() => handleChildrenChange('add')}>
                    <AddCircle />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Lịch trình chi tiết
          </Typography>
          
          {days.map((day, dayIndex) => (
            <Box key={dayIndex} mb={4} border="1px solid #e0e0e0" borderRadius={1} p={2}>
              <Typography variant="h6" gutterBottom sx={{ backgroundColor: '#f5f5f5', p: 1 }}>
                Ngày {day.dayNumber} - {dayjs(day.date).format('DD/MM/YYYY')}
              </Typography>
              
              {day.items.map((item: any, itemIndex: number) => (
                <Box key={itemIndex} mb={2} p={1} borderLeft="4px solid #3f51b5">
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      {item.placeName ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            p: 1
                          }}
                        >
                          {item.placeImage && (
                            <Avatar
                              src={item.placeImage}
                              alt={item.placeName}
                              sx={{ width: 40, height: 40, mr: 1 }}
                              variant="rounded"
                            />
                          )}
                          <Box>
                            <Typography variant="body1">{item.placeName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {item.placeId}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            sx={{ ml: 'auto' }}
                            onClick={() => openPlaceSelectionDialog(dayIndex, itemIndex)}
                          >
                            Đổi
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => openPlaceSelectionDialog(dayIndex, itemIndex)}
                        >
                          Chọn địa điểm
                        </Button>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Box display="flex" gap={1}>
                        <TimePicker
                          label="Giờ đến"
                          value={dayjs(item.visitTime)}
                          onChange={(newValue) => updatePlace(dayIndex, itemIndex, 'visitTime', newValue?.format('YYYY-MM-DDTHH:mm:00'))}
                          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                        <TimePicker
                          label="Giờ đi"
                          value={dayjs(item.departureTime)}
                          onChange={(newValue) => updatePlace(dayIndex, itemIndex, 'departureTime', newValue?.format('YYYY-MM-DDTHH:mm:00'))}
                          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={1} textAlign="center">
                      <IconButton color="error" onClick={() => removePlaceFromDay(dayIndex, itemIndex)}>
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Button 
                startIcon={<Add />}
                variant="outlined" 
                onClick={() => addPlaceToDay(dayIndex)}
                fullWidth
                sx={{ mt: 1 }}
              >
                Thêm địa điểm
              </Button>
            </Box>
          ))}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
          >
            Tạo hành trình
          </Button>
        </DialogActions>
        <PlaceSelectionDialog
          open={isPlaceDialogOpen}
          onClose={() => setIsPlaceDialogOpen(false)}
          onSelectPlace={handleSelectPlace}
        />
      </Dialog>
    </LocalizationProvider>
  );
};

export default ItineraryDialog;