"use client";

import { Box, Button, Card, CssBaseline, FormControl, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import React from 'react';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { toast, ToastContainer } from 'react-toastify';
import { signup } from '@/services/auth';
import Link from 'next/link';

export default function Signup() {
    const [showPassword, setShowPassword] = React.useState(false)
    const [showconfirmPassword, setShowconfirmPassword] = React.useState(false)

    const schema = yup.object().shape({
        name: yup.string().required("Tên không được để trống"),
        username: yup.string().required("Tên đăng nhập không được để trống").min(5, "Tên đăng nhập phải nhiều hơn 5 kí tự"),
        email: yup.string().required("Email không được để trống").email("Email không đúng định dạng"),
        password: yup.string().required("Mật khẩu không được để trống").min(6, "Mật khẩu phải nhiều hơn 6 kí tự"),
        confirmPassword: yup.string()
            .required("Vui lòng nhập lại mật khẩu")
            .oneOf([yup.ref('password')], "Mật khẩu không khớp")
    }).required()

    const { handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        mode: 'onBlur',
        resolver: yupResolver(schema)
    })

    const onSubmit = async (data: { name: string; username: string; email: string; password: string; confirmPassword: string }) => {
        try {
            const response = await signup(data.name, data.username, data.email, data.password, data.confirmPassword);
    
            if (response) {
                toast.success('Đăng ký thành công', {
                    autoClose: 3000,
                });
                window.location.href = '/auth/login';
            }
        } catch (error) {
            console.log(error);
        
            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau.', {
                autoClose: 3000,
            });
        }
    }; 
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '88vh', backgroundColor: '#f4f6f8', padding: 3 }}>
            <CssBaseline enableColorScheme />
            <Card sx={{ maxWidth: 500, width: '100%', padding: 4, borderRadius: 2, boxShadow: 3 }}>
                <Typography
                    component="h1"
                    variant="h5"
                    sx={{ textAlign: 'center', marginBottom: 3, fontWeight: 'bold' }}
                >
                    Đăng ký
                </Typography>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    autoComplete="off"
                >
                    <FormControl fullWidth margin="normal">
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextField
                                    id="name"
                                    label="Tên"
                                    placeholder="Nhập tên"
                                    required
                                    fullWidth
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={Boolean(errors.name)}
                                    helperText={errors.name?.message}
                                />
                            )}
                            name="name"
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextField
                                    id="username"
                                    label="Tên đăng nhập"
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                    fullWidth
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={Boolean(errors.username)}
                                    helperText={errors.username?.message}
                                />
                            )}
                            name="username"
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextField
                                    id="email"
                                    label="Email"
                                    placeholder="Nhập email"
                                    required
                                    fullWidth
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={Boolean(errors.email)}
                                    helperText={errors.email?.message}
                                />
                            )}
                            name="email"
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextField
                                    name="password"
                                    placeholder="Nhập mật khẩu"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    label="Mật khẩu"
                                    required
                                    fullWidth
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={Boolean(errors.password)}
                                    helperText={errors.password?.message}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <MdOutlineVisibility /> : <MdOutlineVisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                            name="password"
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextField
                                    name="confirmPassword"
                                    placeholder="Nhập lại mật khẩu"
                                    type={showconfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    label="Nhập lại mật khẩu"
                                    required
                                    fullWidth
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    error={Boolean(errors.confirmPassword)}
                                    helperText={errors.confirmPassword?.message}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={() => setShowconfirmPassword(!showconfirmPassword)}>
                                                    {showconfirmPassword ? <MdOutlineVisibility /> : <MdOutlineVisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                            name="confirmPassword"
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ marginTop: 2, padding: 1.5, fontWeight: 'bold' }}
                    >
                        Đăng ký
                    </Button>
                    <Typography sx={{ textAlign: 'center', marginTop: 2 }}>
                        Đã có tài khoản?{' '}
                        <Link
                            href="/auth/login" // Sử dụng href thay vì "to"
                            className='text-blue-500'
                        >
                            Đăng nhập
                        </Link>
                    </Typography>
                </form>
            </Card>
            <ToastContainer />
        </Box>
    );
}