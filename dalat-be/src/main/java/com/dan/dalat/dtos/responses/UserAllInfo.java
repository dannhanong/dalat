package com.dan.dalat.dtos.responses;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAllInfo {
    Long id;
    String name;
    String username;
    String password;
    boolean enabled;
    String verificationCode;
    String resetPasswordToken;
    String email;
    String roles;
    LocalDateTime deletedAt;
    String phoneNumber;
    String avatarId;
}
