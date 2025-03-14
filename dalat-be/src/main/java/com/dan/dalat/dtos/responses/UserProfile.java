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
public class UserProfile {
    String name;
    String username;
    String email;
    String phoneNumber;
    String avatarCode;
    LocalDateTime createdAt;
}
