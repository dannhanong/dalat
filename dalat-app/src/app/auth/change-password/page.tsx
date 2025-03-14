"use client";

import React, { useState } from 'react';
import { Box, Button, Card, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { changePassword } from '@/services/auth';

const schema = yup.object().shape({
    oldPassword: yup.string().required('Vui lòng nhập mật khẩu hiện tại'),
    newPassword: yup
        .string()
        .required('Vui lòng nhập mật khẩu mới')
        .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
        .notOneOf([yup.ref('oldPassword')], 'Mật khẩu mới không được giống với mật khẩu hiện tại'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
        .required('Vui lòng xác nhận mật khẩu')
});

export default function ChangePassword() {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
        try {
            const response = await changePassword(data.oldPassword, data.newPassword, data.confirmPassword);
            toast.success(response.message, {
                autoClose: 3000,
            });

            // Reset form after success
            data.oldPassword = '';
            data.newPassword = '';
            data.confirmPassword = '';
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau', {
                autoClose: 3000,
            });
        }
    };

    return (
        <Card sx={{ maxWidth: 600, margin: 'auto', padding: 3, marginY: 6, minHeight: '56vh' }}>
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Thay đổi mật khẩu
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2}>
                <Controller
                    name="oldPassword"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Mật khẩu hiện tại"
                            type={showOldPassword ? 'text' : 'password'}
                            fullWidth
                            error={!!errors.oldPassword}
                            helperText={errors.oldPassword?.message}
                            margin="normal"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            sx={{ outline: 'none', border: 'none' }}
                                        >
                                            {showOldPassword ? <MdOutlineVisibility /> : <MdOutlineVisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    )}
                />
                <Controller
                    name="newPassword"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Mật khẩu mới"
                            type={showNewPassword ? 'text' : 'password'}
                            fullWidth
                            error={!!errors.newPassword}
                            helperText={errors.newPassword?.message}
                            margin="normal"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            sx={{ outline: 'none', border: 'none' }}
                                        >
                                            {showNewPassword ? <MdOutlineVisibility /> : <MdOutlineVisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    )}
                />
                <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Xác nhận mật khẩu"
                            type={showConfirmPassword ? 'text' : 'password'}
                            fullWidth
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            margin="normal"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            sx={{ outline: 'none', border: 'none' }}
                                        >
                                            {showConfirmPassword ? <MdOutlineVisibility /> : <MdOutlineVisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    )}
                />
                <Button type="submit" variant="contained" color="primary">
                    Lưu thay đổi
                </Button>
            </Box>
            <ToastContainer />
        </Card>
    );
}
