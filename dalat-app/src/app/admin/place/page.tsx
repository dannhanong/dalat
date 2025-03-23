'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit as EditIcon, CircleOff, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import dayjs from 'dayjs';
import Pagination from '@/components/Pagination';
import { getAllPlaces, updateShow } from '@/services/place';
import { Place } from '@/models/Place';
import Image from 'next/image';

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
    const [places, setplaces] = useState<Place[]>([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Place>>({
        name: '',
        description: '',
    });
    const [editId, setEditId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const handleOpen = (place?: Place) => {
        if (place) {
            // Chỉnh sửa place hiện có
            setFormData({
                id: place.id,
                name: place.name || '',
                description: place.description || '',
            });
            setEditId(place.id);
        } else {
            // Thêm mới - reset form
            setFormData({
                name: '',
                description: '',
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

    // const validateForm = () => {
    //     if (!formData.name?.trim()) {
    //         toast.error('Vui lòng nhập tên lễ hội');
    //         return false;
    //     }
    //     if (!formData.description?.trim()) {
    //         toast.error('Vui lòng chọn ngày bắt đầu');
    //         return false;
    //     }
    //     return true;
    // };

    // const handleSave = async () => {
    //     if (!validateForm()) {
    //         return;
    //     }

    //     setLoading(true);
    //     try {
    //         if (editId) {
    //             // Cập nhật - truyền đúng 2 tham số: id và place object
    //             await updateplace(editId, formData as place);
    //             toast.success('Cập nhật lễ hội thành công');
    //         } else {
    //             // Tạo mới
    //             await createplace(formData as place);
    //             toast.success('Thêm lễ hội mới thành công');
    //         }
    //         fetchAllPlaces();
    //         handleClose();
    //     } catch (error) {
    //         console.error('Error saving place:', error);
    //         toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleUpdateShow = (id: number) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn cập nhật địa điểm này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            cancelButtonColor: '#3085d6',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await updateShow(id);
                    if (response) {
                        fetchAllPlaces();
                        toast.success('Cập nhật thành công');
                    }
                } catch (error) {
                    console.error('Error deleting place:', error);
                    toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                }
            }
        });
    };

    const fetchAllPlaces = async () => {
        setLoading(true);
        try {
            const response = await getAllPlaces(keyword, currentPage);
            setplaces(response.content || []);
            setTotalPages(response.page.totalPages);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách địa điểm');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    useEffect(() => {
        fetchAllPlaces();
    }, [keyword, currentPage]);

    // const formatDate = (dateString: string) => {
    //     if (!dateString) return '';
    //     try {
    //         return dayjs(dateString).format('DD/MM/YYYY');
    //     } catch (error) {
    //         console.log('Error formatting date:', error);
    //         return dateString;
    //     }
    // };

    return (
        <Container sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>
                Quản lý các địa điểm du lịch Đà Lạt
            </Typography>

            {/* Search and Add place */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Tìm kiếm địa điểm"
                    variant="outlined"
                    size="small"
                    value={keyword}
                    onChange={handleSearch}
                    sx={{ width: '300px' }}
                />
                {/* <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                    Thêm mới
                </Button> */}
            </Box>

            {/* place Table */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Tên</TableCell>
                        <TableCell>Danh mục</TableCell>
                        <TableCell>Hình ảnh</TableCell>
                        <TableCell>Giá người lớn</TableCell>
                        <TableCell>Giá trẻ em</TableCell>
                        <TableCell>Tình trạng</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {places.length > 0 ? (
                        places.map((place, index) => (
                            <TableRow key={place.id}>
                                <TableCell>{index + 1 + currentPage * 10}</TableCell>
                                <TableCell>{place.name}</TableCell>
                                <TableCell>{place.category.name}</TableCell>
                                <TableCell>
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/files/preview/${place.imageCode}`}
                                        alt="Avatar"
                                        width={50}
                                        height={50}
                                    />
                                </TableCell>
                                <TableCell>{place.adultFare?.toLocaleString('vi-VN')}</TableCell>
                                <TableCell>{place.childFare?.toLocaleString('vi-VN')}</TableCell>
                                <TableCell>
                                    {
                                        place.show ? (
                                            <span className="text-green-600">Đã duyệt</span>
                                        ) : (
                                            <span className="text-red-600">Chưa duyệt</span>
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleOpen(place)}>
                                        <EditIcon />
                                    </IconButton>
                                    {
                                        place.show ? (
                                            <IconButton color="error" onClick={() => handleUpdateShow(place.id)}>
                                                <CircleOff />
                                            </IconButton>
                                        ) : (
                                            <IconButton color="error" onClick={() => handleUpdateShow(place.id)}>
                                                <Check color='green' />
                                            </IconButton>
                                        )
                                    }
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={12} align="center">
                                Không có dữ liệu
                            </TableCell>
                        </TableRow>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
                <DialogTitle>{editId ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm Mới'}</DialogTitle>
                <DialogContent>
                    <FormContainer>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Tên địa điểm"
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

                    </FormContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit" disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        // onClick={handleSave}
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