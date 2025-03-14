package com.dan.dalat.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupForm {
    private String name;

    @Pattern(regexp = "^[a-zA-Z0-9_]{3,100}$", message = "Tên đăng nhập phải bắt đầu bằng chữ cái, không chứa ký tự đặc biệt và có độ dài từ 3 đến 100 ký tự")
    private String username;

    private String password;
    private String confirmPassword;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String roles;

    @Pattern(regexp = "(\\d{4}[-.]?\\d{3}[-.]?\\d{3})", message = "Số điện thoại phải bao gồm 10 chữ số và có thể có dấu chấm hoặc dấu gạch ngang giữa các phần tử")
    private String phoneNumber;
    private String avatarId;
}