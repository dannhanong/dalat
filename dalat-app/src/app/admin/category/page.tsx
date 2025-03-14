'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit as EditIcon, Trash as DeleteIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '@/components/Pagination';
import { createCategory, deleteCategory, getCategories, updateCategory, updateService, deleteService, createService } from '@/services/category';
import { Category } from '@/models/Category';
import { AddCircle } from '@mui/icons-material';
import { getServicesByCategoryId } from '@/services/place';

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
    const [categories, setCategories] = useState<Category[]>([]);
    const [open, setOpen] = useState(false);
    const [openService, setOpenService] = useState(false);
    const [formData, setFormData] = useState<Partial<Category>>({
        name: ''
    });
    const [serviceFormData, setServiceFormData] = useState<{
        name: string;
        categoryId: number | null;
    }>({
        name: '',
        categoryId: null
    });
    const [editId, setEditId] = useState<number | null>(null);
    const [editServiceId, setEditServiceId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [services, setServices] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const handleOpen = (category?: Category) => {
        if (category) {
            // Chỉnh sửa category hiện có
            setFormData({
                id: category.id,
                name: category.name || '',
            });
            setEditId(category.id);
        } else {
            // Thêm mới - reset form
            setFormData({
                name: '',
            });
            setEditId(null);
        }
        setOpen(true);
    };

    const handleOpenService = async (category?: Category) => {
        if (category) {
            setSelectedCategoryId(category.id);
            setServiceFormData({
                name: '',
                categoryId: category.id
            });

            try {
                const response = await getServicesByCategoryId(category.id);
                setServices(response || []);
            } catch (error) {
                console.error('Error fetching services:', error);
                toast.error('Không thể tải danh sách dịch vụ');
            }
            setOpenService(true);
        }
    };

    const handleEditService = (service: any) => {
        setServiceFormData({
            name: service.name,
            categoryId: selectedCategoryId
        });
        setEditServiceId(service.id);
    };

    const handleDeleteService = (serviceId: number) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa dịch vụ này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            cancelButtonColor: '#3085d6',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await deleteService(serviceId);
                    if (response) {
                        // Refresh services list
                        if (selectedCategoryId) {
                            const updatedServices = await getServicesByCategoryId(selectedCategoryId);
                            setServices(updatedServices || []);
                        }
                        toast.success('Xóa dịch vụ thành công');
                    }
                } catch (error) {
                    console.error('Error deleting service:', error);
                    toast.error('Đã xảy ra lỗi khi xóa dịch vụ');
                }
            }
        });
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseService = () => {
        setOpenService(false);
        setServiceFormData({
            name: '',
            categoryId: null
        });
        setEditServiceId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setServiceFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name?.trim()) {
            toast.error('Vui lòng nhập tên danh mục');
            return false;
        }
        return true;
    };

    const validateServiceForm = () => {
        if (!serviceFormData.name?.trim()) {
            toast.error('Vui lòng nhập tên dịch vụ');
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
                await updateCategory(editId, formData as Category);
                toast.success('Cập nhật danh mục thành công');
            } else {
                // Tạo mới
                await createCategory(formData as Category);
                toast.success('Thêm danh mục mới thành công');
            }
            fetchAllCategories();
            handleClose();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveService = async () => {
        if (!validateServiceForm()) {
            return;
        }

        setLoading(true);
        try {
            if (editServiceId) {
                await updateService(editServiceId, serviceFormData);
                toast.success('Cập nhật dịch vụ thành công');
            } else {
                // Tạo mới dịch vụ
                await createService(serviceFormData);
                toast.success('Thêm dịch vụ mới thành công');
            }
            
            // Refresh services list
            if (selectedCategoryId) {
                const updatedServices = await getServicesByCategoryId(selectedCategoryId);
                setServices(updatedServices || []);
            }
            
            // Reset form
            setServiceFormData({
                name: '',
                categoryId: selectedCategoryId
            });
            setEditServiceId(null);
        } catch (error) {
            console.error('Error saving service:', error);
            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa danh mục này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            cancelButtonColor: '#3085d6',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await deleteCategory(id);
                    if (response) {
                        fetchAllCategories();
                        toast.success('Xóa thành công');
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                }
            }
        });
    };

    const fetchAllCategories = async () => {
        setLoading(true);
        try {
            const response = await getCategories(keyword, currentPage);
            setCategories(response.content || []);
            setTotalPages(response.page.totalPages);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    useEffect(() => {
        fetchAllCategories();
    }, [keyword, currentPage]);

    return (
        <Container sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>
                Quản lý danh mục
            </Typography>

            {/* Search and Add Category */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Tìm kiếm danh mục"
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

            {/* Category Table */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Tên danh mục</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {categories.length > 0 ? (
                        categories.map((category, index) => (
                            <TableRow key={category.id}>
                                <TableCell>{index + 1 + currentPage * 10}</TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleOpen(category)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(category.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton color="info" onClick={() => handleOpenService(category)} title="Quản lý dịch vụ">
                                        <AddCircle />
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
                </TableBody>
            </Table>
            
            <Box sx={{ mt: 2 }}>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                />
            </Box>

            {/* Dialog for Add/Edit Category */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>{editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục Mới'}</DialogTitle>
                <DialogContent>
                    <FormContainer>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Tên danh mục"
                            type="text"
                            fullWidth
                            value={formData.name || ''}
                            onChange={handleChange}
                            required
                        />
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

            {/* Dialog for Services Management */}
            <Dialog open={openService} onClose={handleCloseService} fullWidth maxWidth="md">
                <DialogTitle>
                    {selectedCategoryId ? `Quản lý dịch vụ - ${categories.find(c => c.id === selectedCategoryId)?.name || ''}` : 'Quản lý dịch vụ'}
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mb: 3, mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {editServiceId ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                        </Typography>
                        <FormContainer>
                            <TextField
                                autoFocus
                                margin="dense"
                                name="name"
                                label="Tên dịch vụ"
                                type="text"
                                fullWidth
                                value={serviceFormData.name || ''}
                                onChange={handleServiceChange}
                                required
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                {editServiceId && (
                                    <Button 
                                        onClick={() => {
                                            setServiceFormData({
                                                name: '',
                                                categoryId: selectedCategoryId
                                            });
                                            setEditServiceId(null);
                                        }} 
                                        color="inherit" 
                                        sx={{ mr: 1 }}
                                        disabled={loading}
                                    >
                                        Hủy chỉnh sửa
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSaveService}
                                    color="primary"
                                    variant="contained"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : editServiceId ? 'Cập nhật' : 'Thêm mới'}
                                </Button>
                            </Box>
                        </FormContainer>
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Danh sách dịch vụ
                    </Typography>
                    {services.length > 0 ? (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>STT</TableCell>
                                    <TableCell>Tên dịch vụ</TableCell>
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {services.map((service: any, index: number) => (
                                    <TableRow key={service.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{service.name}</TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleEditService(service)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDeleteService(service.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                            Không có dịch vụ nào trong danh mục này
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseService} color="primary" variant="contained">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
            <ToastContainer />
        </Container>
    );
}