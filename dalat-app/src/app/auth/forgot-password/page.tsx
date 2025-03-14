"use client";

import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { toast, ToastContainer } from "react-toastify";
import { forgotPassword } from "@/services/auth";

export default function ForgotPassword() {
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSubmit = async () => {
        if (!email) {
            setError("Email không được để trống.");
            return;
        }
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            setError("Email không hợp lệ.");
            return;
        }

        try {
            const response = await forgotPassword(email);
            if (response) {
                toast.success("Gửi mật khẩu tới email thành công, hãy kiểm tra", {
                    autoClose: 3000,
                });
                setEmail("");
            } else {
                toast.error("Có lỗi xảy ra", {
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.log("Error during forgot password:", error);
            
            toast.error("Có lỗi xảy ra hoặc email chưa được đăng ký", {
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-100" style={{ height: "88vh" }}>
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                    Forgot Password
                </h2>
                <p className="text-sm text-gray-600 mb-6 text-center">
                    Nhập email đã đăng kí của bạn để nhận mật khẩu mới
                </p>
                <div className="mb-4">
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!error}
                        helperText={error}
                    />
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmit}
                    className="!bg-blue-500 hover:!bg-blue-600"
                >
                    Gửi yêu cầu
                </Button>
            </div>
            <ToastContainer />
        </div>
    );
}