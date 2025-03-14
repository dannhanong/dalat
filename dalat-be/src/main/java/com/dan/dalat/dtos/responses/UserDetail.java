package com.dan.dalat.dtos.responses;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetail {
    private Long id;
    private String name;
    private String username;
    private String password;
    private boolean enabled;
    private String verificationCode;
    private String resetPasswordToken;
    private String email;
    String roles;
    private LocalDateTime deletedAt;
}
