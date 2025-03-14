'use client';

import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Box, Typography, Divider, Tabs, Tab, Button, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import locale data for Vietnamese
import { Festival } from '@/models/Festival';

// Cấu hình dayjs
dayjs.locale('vi');

// Styled components
const EventContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    margin: theme.spacing(2, 0),
}));

const EventTitle = styled(Typography)({
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: '8px',
});

const EventDetail = styled(Typography)({
    marginLeft: '16px',
    marginBottom: '4px',
});

const TabStyled = styled(Tab)({
    border: '1px solid #d32f2f',
    borderRadius: '4px',
    marginRight: '8px',
    color: '#d32f2f',
    '&.Mui-selected': {
        backgroundColor: '#d32f2f',
        color: '#fff',
    },
});

const DateFilterContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    backgroundColor: '#f5f5f5',
    borderRadius: theme.shape.borderRadius,
}));

export default function Index() {
  const [groupedFestivals, setGroupedFestivals] = useState<Record<string, Festival[]>>({});
  const [dates, setDates] = useState<string[]>([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(1, 'month'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Xử lý khi thay đổi tab
  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setSelectedTabIndex(newValue);
  };

  // Hàm để fetch festivals theo khoảng thời gian
  const fetchFestivalsByDateRange = async (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
    setIsLoading(true);

    try {
      let url = '/festivals/public/grouped';

      // Nếu có chọn khoảng thời gian
      if (start && end) {
        const startDateString = start.format('YYYY-MM-DD');
        const endDateString = end.format('YYYY-MM-DD');
        url = `/festivals/public/by-date/grouped?startDate=${startDateString}&endDate=${endDateString}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`);
      const data = await response.json();

      // Chuyển đổi dữ liệu từ Map sang đúng định dạng để xử lý dễ dàng hơn
      const formattedData: Record<string, Festival[]> = {};

      // Sắp xếp các ngày theo thứ tự tăng dần
      const sortedDates = Object.keys(data).sort();

      sortedDates.forEach(date => {
        formattedData[date] = data[date];
      });

      setGroupedFestivals(formattedData);
      setDates(sortedDates);

      // Nếu có dữ liệu, chọn tab đầu tiên
      if (sortedDates.length > 0) {
        setSelectedTabIndex(0);
      }

      console.log('Grouped festivals:', formattedData);
    } catch (error) {
      console.error('Error fetching festivals by date range:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi click nút lọc
  const handleFilterClick = () => {
    fetchFestivalsByDateRange(startDate, endDate);
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchFestivalsByDateRange(startDate, endDate);
  }, []);

  // Format ngày hiển thị cho tab
  const formatDateForTab = (dateString: string) => {
    try {
      return dayjs(dateString).format('DD/MM/YYYY');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', minHeight: '88vh' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
        Lịch sự kiện và lễ hội ở Đà Lạt
      </Typography>

      {/* Filter by date range */}
      <DateFilterContainer>
        <Typography variant="h6" sx={{ mb: 2 }}>Chọn khoảng thời gian</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='vi'>
              <DatePicker
                label="Từ ngày"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue ?? dayjs())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='vi'>
              <DatePicker
                label="Đến ngày"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue ?? dayjs().add(1, 'month'))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={2} md={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFilterClick}
              fullWidth
            >
              Lọc
            </Button>
          </Grid>
        </Grid>
      </DateFilterContainer>

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      ) : (
        <>
          {/* Tabs for dates */}
          {dates.length > 0 ? (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                  value={selectedTabIndex}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="festival dates"
                >
                  {dates.map((date, index) => (
                    <TabStyled key={index} label={formatDateForTab(date)} />
                  ))}
                </Tabs>
              </Box>

              {/* Festival list for selected date */}
              {dates[selectedTabIndex] && (
                <EventContainer>
                  <Typography variant="h5" sx={{ mb: 3, color: '#1976d2' }}>
                    Sự kiện ngày {formatDateForTab(dates[selectedTabIndex])}
                  </Typography>

                  {groupedFestivals[dates[selectedTabIndex]] &&
                    groupedFestivals[dates[selectedTabIndex]].length > 0 ? (
                    groupedFestivals[dates[selectedTabIndex]].map((festival, index) => (
                      <Box key={index} mb={3}>
                        <EventTitle variant="h6">{festival.name}</EventTitle>
                        <EventDetail>Thời gian: {formatDateForTab(festival.startDate)}</EventDetail>
                        <EventDetail>Mô tả: {festival.description}</EventDetail>
                        <Divider sx={{ my: 2, borderColor: '#1976d2' }} />
                      </Box>
                    ))
                  ) : (
                    <Typography>Không có sự kiện nào diễn ra vào ngày này.</Typography>
                  )}
                </EventContainer>
              )}
            </>
          ) : (
            <EventContainer>
              <Typography>Không có sự kiện nào trong khoảng thời gian đã chọn.</Typography>
            </EventContainer>
          )}
        </>
      )}
    </Box>
  );
}