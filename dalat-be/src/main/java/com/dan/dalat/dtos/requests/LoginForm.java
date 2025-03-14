package com.dan.dalat.dtos.requests;

import lombok.*;

@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginForm {
    private String username;
    private String password;
    private boolean rememberMe;
}
