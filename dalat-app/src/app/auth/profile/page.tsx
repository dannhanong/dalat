"use client";

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, TextField, Typography, Avatar } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useProfile } from '@/contexts/ProfileContext';
import { updateProfile } from '@/services/auth';

export default function Profile() {
  const { profile, reloadProfile } = useProfile();
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const schema = yup.object().shape({
    name: yup.string()
      .required("Họ và tên không được để trống")
      .min(5, "Họ và tên phải có ít nhất 5 ký tự"),
    phoneNumber: yup.string()
      .required("Số điện thoại không được để trống")
      .matches(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số")
  }).required();

  const { handleSubmit, control, formState: { errors }, setValue } = useForm({
    defaultValues: {
      name: profile.name || '',
      phoneNumber: profile.phoneNumber || ''
    },
    mode: 'onBlur',
    resolver: yupResolver(schema)
  });

  // Cập nhật form khi profile thay đổi
  useEffect(() => {
    setValue('name', profile.name);
    setValue('phoneNumber', profile.phoneNumber);
  }, [profile, setValue]);

  const onSubmit = async (data: { name: string; phoneNumber: string }) => {
    try {
      const response = await updateProfile(data.name, data.phoneNumber, selectedFile);
      toast.success(response.message, {
        autoClose: 3000,
      });
      reloadProfile();
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Tạo URL để xem trước ảnh
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 600, margin: 'auto', padding: 3, marginY: 6, minHeight: '56vh' }}>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Chỉnh sửa thông tin cá nhân
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Button variant="contained" component="label" sx={{ borderRadius: "100%", width: 100, height: 100 }}>
                <Avatar
                  src={previewUrl || profile.avatarUrl || '/default-avatar.png'}
                  alt="Avatar"
                  sx={{ width: 100, height: 100 }}
                />
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Box>
            <Box>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Họ và tên"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số điện thoại"
                    fullWidth
                    margin="normal"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
              <Button
                variant="contained"
                color="primary"
                type="submit"
              >
                Lưu thay đổi
              </Button>
            </Box>
          </Box>
        </Box>
        <ToastContainer />
      </Card>
    </>
  );
}
