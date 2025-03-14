import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, IconButton, Divider
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Close as CloseIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

type TimeSelectionDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: (visitTime: string, leaveTime: string) => void;
    initialVisitTime?: string;
    initialLeaveTime?: string;
};

const TimeSelectionDialog: React.FC<TimeSelectionDialogProps> = ({ 
    open, 
    onClose, 
    onConfirm, 
    initialVisitTime = "08:00", 
    initialLeaveTime = "10:00" 
}) => {
    const [visitTime, setVisitTime] = useState<dayjs.Dayjs | null>(null);
    const [leaveTime, setLeaveTime] = useState<dayjs.Dayjs | null>(null);
    const [visitTimeError, setVisitTimeError] = useState<string | null>(null);
    const [leaveTimeError, setLeaveTimeError] = useState<string | null>(null);

    // Khởi tạo giá trị thời gian
    useEffect(() => {
        if (open) {
            // Tạo một ngày hiện tại để gắn giờ vào
            const today = dayjs();
            
            // Xử lý visitTime
            const [visitHour, visitMinute] = initialVisitTime.split(':').map(Number);
            const visitDayjs = today.hour(visitHour).minute(visitMinute);
            setVisitTime(visitDayjs);
            
            // Xử lý leaveTime
            const [leaveHour, leaveMinute] = initialLeaveTime.split(':').map(Number);
            const leaveDayjs = today.hour(leaveHour).minute(leaveMinute);
            setLeaveTime(leaveDayjs);
            
            // Reset lỗi
            setVisitTimeError(null);
            setLeaveTimeError(null);
        }
    }, [open, initialVisitTime, initialLeaveTime]);

    const handleVisitTimeChange = (newValue: dayjs.Dayjs | null) => {
        setVisitTime(newValue);
        
        // Kiểm tra thời gian đến và đi
        if (newValue && leaveTime && newValue.isAfter(leaveTime)) {
            setVisitTimeError("Thời gian đến phải trước thời gian đi");
        } else {
            setVisitTimeError(null);
            setLeaveTimeError(null);
        }
    };

    const handleLeaveTimeChange = (newValue: dayjs.Dayjs | null) => {
        setLeaveTime(newValue);
        
        // Kiểm tra thời gian đến và đi
        if (visitTime && newValue && newValue.isBefore(visitTime)) {
            setLeaveTimeError("Thời gian đi phải sau thời gian đến");
        } else {
            setVisitTimeError(null);
            setLeaveTimeError(null);
        }
    };

    const handleConfirm = () => {
        if (!visitTime || !leaveTime) {
            return;
        }
        
        // Kiểm tra thời gian đến và đi
        if (visitTime.isAfter(leaveTime)) {
            setVisitTimeError("Thời gian đến phải trước thời gian đi");
            return;
        }
        
        // Format giờ:phút
        const formattedVisitTime = visitTime.format('HH:mm');
        const formattedLeaveTime = leaveTime.format('HH:mm');
        
        onConfirm(formattedVisitTime, formattedLeaveTime);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Chọn thời gian tham quan</Typography>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                
                <DialogContent>
                    <Box py={2}>
                        <Typography gutterBottom>
                            Vui lòng chọn thời gian đến và thời gian rời khỏi địa điểm
                        </Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box display="flex" gap={2} mt={3}>
                            <Box flex={1}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Thời gian đến:
                                </Typography>
                                <TimePicker
                                    value={visitTime}
                                    onChange={handleVisitTimeChange}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!visitTimeError,
                                            helperText: visitTimeError
                                        }
                                    }}
                                    ampm={false}
                                />
                            </Box>
                            
                            <Box flex={1}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Thời gian rời đi:
                                </Typography>
                                <TimePicker
                                    value={leaveTime}
                                    onChange={handleLeaveTimeChange}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!leaveTimeError,
                                            helperText: leaveTimeError
                                        }
                                    }}
                                    ampm={false}
                                />
                            </Box>
                        </Box>
                        
                        <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                            <Typography variant="body2">
                                Sau khi chọn thời gian, bạn sẽ tiếp tục chọn địa điểm để thêm vào lịch trình
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} color="inherit">
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleConfirm} 
                        variant="contained" 
                        color="primary"
                        disabled={!visitTime || !leaveTime || !!visitTimeError || !!leaveTimeError}
                    >
                        Tiếp tục chọn địa điểm
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default TimeSelectionDialog;