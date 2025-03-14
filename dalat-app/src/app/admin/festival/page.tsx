'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Festival } from '@/models/Festival';
import { Edit as EditIcon, Trash as DeleteIcon } from 'lucide-react';
import { createFestival, deleteFestival, getAllFestivals, updateFestival } from '@/services/festival';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Pagination from '@/components/Pagination';

// Styled components với Tailwind CSS
const Container = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '1200px',
    margin: '0 auto',
}));

const FormContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px',
});

export default function Index() {
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Festival>>({
        name: '',
        description: '',
        startDate: ''
    });
    const [editId, setEditId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const handleOpen = (festival?: Festival) => {
        if (festival) {
            // Chỉnh sửa festival hiện có
            setFormData({
                id: festival.id,
                name: festival.name || '',
                description: festival.description || '',
                startDate: festival.startDate || ''
            });
            setEditId(festival.id);
        } else {
            // Thêm mới - reset form
            setFormData({
                name: '',
                description: '',
                startDate: dayjs().format('YYYY-MM-DD')
            });
            setEditId(null);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, date: dayjs.Dayjs | null) => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                [name]: date.format('YYYY-MM-DD')
            }));
        }
    };

    const validateForm = () => {
        if (!formData.name?.trim()) {
            toast.error('Vui lòng nhập tên lễ hội');
            return false;
        }
        if (!formData.startDate?.trim()) {
            toast.error('Vui lòng chọn ngày bắt đầu');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            if (editId) {
                // Cập nhật - truyền đúng 2 tham số: id và festival object
                await updateFestival(editId, formData as Festival);
                toast.success('Cập nhật lễ hội thành công');
            } else {
                // Tạo mới
                await createFestival(formData as Festival);
                toast.success('Thêm lễ hội mới thành công');
            }
            fetchAllFestivals();
            handleClose();
        } catch (error) {
            console.error('Error saving festival:', error);
            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa lễ hội này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            cancelButtonColor: '#3085d6',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await deleteFestival(id);
                    if (response) {
                        fetchAllFestivals();
                        toast.success('Xóa thành công');
                    }
                } catch (error) {
                    console.error('Error deleting festival:', error);
                    toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                }
            }
        });
    };

    const fetchAllFestivals = async () => {
        setLoading(true);
        try {
            const response = await getAllFestivals(keyword, currentPage);
            setFestivals(response.content || []);
            setTotalPages(response.page.totalPages);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách lễ hội');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    useEffect(() => {
        fetchAllFestivals();
    }, [keyword, currentPage]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return dayjs(dateString).format('DD/MM/YYYY');
        } catch (error) {
            console.log('Error formatting date:', error);
            return dateString;
        }
    };

    return (
        <Container sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>
                Quản lý Lễ Hội Festival Đà Lạt
            </Typography>

            {/* Search and Add Festival */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Tìm kiếm lễ hội"
                    variant="outlined"
                    size="small"
                    value={keyword}
                    onChange={handleSearch}
                    sx={{ width: '300px' }}
                />
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                    Thêm mới
                </Button>
            </Box>

            {/* Festival Table */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Tên lễ hội</TableCell>
                        <TableCell>Ngày bắt đầu</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {festivals.length > 0 ? (
                        festivals.map((festival, index) => (
                            <TableRow key={festival.id}>
                                <TableCell>{index + 1 + currentPage * 10}</TableCell>
                                <TableCell>{festival.name}</TableCell>
                                <TableCell>{formatDate(festival.startDate)}</TableCell>
                                <TableCell>{festival.description}</TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleOpen(festival)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(festival.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                Không có dữ liệu
                            </TableCell>
                        </TableRow>
                    )}
                    <Box sx={{ mt: 2, width: '330%' }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(newPage) => setCurrentPage(newPage)}
                        />
                    </Box>
                </TableBody>
            </Table>

            {/* Dialog for Add/Edit */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>{editId ? 'Chỉnh sửa Lễ Hội' : 'Thêm Lễ Hội Mới'}</DialogTitle>
                <DialogContent>
                    <FormContainer>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Tên lễ hội"
                            type="text"
                            fullWidth
                            value={formData.name || ''}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            margin="dense"
                            name="description"
                            label="Mô tả"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description || ''}
                            onChange={handleChange}
                        />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Ngày bắt đầu"
                                value={formData.startDate ? dayjs(formData.startDate) : null}
                                onChange={(date) => handleDateChange('startDate', date)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: 'dense',
                                        required: true
                                    }
                                }}
                            />
                        </LocalizationProvider>

                    </FormContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit" disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        color="primary"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Lưu'}
                    </Button>
                </DialogActions>
            </Dialog>
            <ToastContainer position="top-right" autoClose={3000} />
        </Container>
    );
}