'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LockIcon, UnlockIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '@/components/Pagination';
import { blockAccount, getAllAccounts } from '@/services/account';
import { User } from '@/models/User';
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
    const [accounts, setAccounts] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
    });
    // const [editId, setEditId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    // const handleOpen = (account?: User) => {
    //     if (account) {
    //         // Chỉnh sửa account hiện có
    //         setFormData({
    //             id: account.id,
    //             name: account.name || '',
    //             username: account.username || '',
    //         });
    //         setEditId(account.id);
    //     } else {
    //         // Thêm mới - reset form
    //         setFormData({
    //             name: '',
    //             username: '',
    //         });
    //         setEditId(null);
    //     }
    //     setOpen(true);
    // };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // const validateForm = () => {
    //     if (!formData.name?.trim()) {
    //         toast.error('Vui lòng nhập tên');
    //         return false;
    //     }
    //     if (!formData.username?.trim()) {
    //         toast.error('Vui lòng nhập tên đăng nhập');
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
    //             // Cập nhật - truyền đúng 2 tham số: id và account object
    //             await updateaccount(editId, formData as account);
    //             toast.success('Cập nhật tài khoản thành công');
    //         } else {
    //             // Tạo mới
    //             await createaccount(formData as account);
    //             toast.success('Thêm tài khoản mới thành công');
    //         }
    //         fetchAllAccounts();
    //         handleClose();
    //     } catch (error) {
    //         console.error('Error saving account:', error);
    //         toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn cập nhật tài khoản này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            cancelButtonColor: '#3085d6',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await blockAccount(id);
                    if (response) {
                        fetchAllAccounts();
                        toast.success('Cập nhật thành công');
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                }
            }
        });
    };

    const fetchAllAccounts = async () => {
        setLoading(true);
        try {
            const response = await getAllAccounts(keyword, currentPage);
            setAccounts(response.content || []);
            setTotalPages(response.page.totalPages);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách tài khoản');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    useEffect(() => {
        fetchAllAccounts();
    }, [keyword, currentPage]);

    return (
        <Container sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>
                Quản lý tài khoản
            </Typography>

            {/* Search and Add account */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Tìm kiếm tài khoản"
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

            {/* account Table */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Họ tên</TableCell>
                        <TableCell>Tên đăng nhập</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Quyền</TableCell>
                        <TableCell>Ảnh đại diện</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {accounts.length > 0 ? (
                        accounts.map((account, index) => (
                            <TableRow key={account.id}>
                                <TableCell>{index + 1 + currentPage * 10}</TableCell>
                                <TableCell>{account.name}</TableCell>
                                <TableCell>{account.username}</TableCell>
                                <TableCell>{account.email}</TableCell>
                                <TableCell>{account.roles}</TableCell>
                                <TableCell>
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/files/preview/${account.avatarId}`}
                                        alt="Avatar"
                                        width={50}
                                        height={50}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={!account.enabled ? 'Đã khóa' : 'Hoạt động'}
                                        color={!account.enabled ? 'error' : 'success'}
                                    />
                                </TableCell>
                                <TableCell>
                                    {/* <IconButton color="primary" onClick={() => handleOpen(account)}>
                                        <EditIcon />
                                    </IconButton> */}
                                    {
                                        account.enabled ? (
                                            <IconButton color="error" onClick={() => handleDelete(account.id)}>
                                                <LockIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton color="success" onClick={() => handleDelete(account.id)}>
                                                <UnlockIcon />
                                            </IconButton>
                                        )
                                    }
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
                {/* <DialogTitle>{editId ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản Mới'}</DialogTitle> */}
                <DialogContent>
                    <FormContainer>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Họ tên"
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