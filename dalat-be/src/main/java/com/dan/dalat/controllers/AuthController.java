package com.dan.dalat.controllers;

import com.dan.dalat.dtos.requests.*;
import com.dan.dalat.dtos.responses.LoginResponse;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.dtos.responses.UserAllInfo;
import com.dan.dalat.dtos.responses.UserProfile;
import com.dan.dalat.security.jwt.JwtService;
import com.dan.dalat.services.AccountService;
import com.dan.dalat.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private AccountService accountService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<?> signup(@Valid @RequestBody SignupForm signupForm) {
        return new ResponseEntity<>(accountService.signupAccount(signupForm), HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginForm loginForm) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginForm.getUsername(), loginForm.getPassword()));

            if (authentication.isAuthenticated()) {
                final String accessToken = jwtService.generateToken(loginForm.getUsername(), authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));
                final String refreshToken = jwtService.generateRefreshToken(loginForm.getUsername(), authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));

                LoginResponse tokens = LoginResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build();
                
                return new ResponseEntity<>(tokens, HttpStatus.OK);
            }
        } catch (AuthenticationException e) {
            return new ResponseEntity<>(new ResponseMessage(401, "Thông tin đăng nhập không chính xác"), HttpStatus.UNAUTHORIZED);
        }

        return new ResponseEntity<>(new ResponseMessage(401, "Thông tin đăng nhập không chính xác"), HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/admin/create-account")
    public ResponseEntity<?> createAccount(@Valid @RequestBody SignupForm signupForm) {
        return new ResponseEntity<>(accountService.createAccountByAdmin(signupForm), HttpStatus.OK);
    }

//    @PutMapping("/admin/update-account/{userId}")
//    public ResponseEntity<ResponseMessage> updateAccountByAdmin(@PathVariable("userId") Long userId,
//                                           @Valid @RequestBody UpdateUserByAdminRequest updateUserByAdminRequest) {
//        return new ResponseEntity<>(accountService.updateAccountByAdmin(userId, updateUserByAdminRequest), HttpStatus.OK);
//    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        token = token.substring(7);
        jwtService.deleteToken(token);
        return new ResponseEntity<>(new ResponseMessage(200, "Đăng xuất thành công"), HttpStatus.OK);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || jwtService.isTokenExpired(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token");
        }

        String username = jwtService.extractUsername(refreshToken);
        List<String> roles = jwtService.extractClaim(refreshToken, claims -> claims.get("roles", List.class));
        String newAccessToken = jwtService.generateToken(username, roles);
        String newRefreshToken = jwtService.generateRefreshToken(username, roles);

//        Map<String, String> tokens = new HashMap<>();
//        tokens.put("accessToken", newAccessToken);
//        tokens.put("refreshToken", newRefreshToken);
        LoginResponse tokens = LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();

        return ResponseEntity.ok(tokens);
    }

    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        jwtService.validateToken(token);
        return "true";
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestParam("code") String code){
        boolean verified = userService.verify(code);
        String message = verified ? "Tài khoản đã được xác minh" : "Mã xác minh không hợp lệ";
        return new ResponseEntity<>(ResponseMessage.builder().status(200).message(message), HttpStatus.OK);
    }

    @GetMapping("/admin/get-all-users")
    public ResponseEntity<Page<UserAllInfo>> getAllUserAndByKeyword(@RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size,
                                                                    @RequestParam(defaultValue = "name") String sortBy,
                                                                    @RequestParam(defaultValue = "asc") String order,
                                                                    @RequestParam(defaultValue = "") String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(order), sortBy));
        return new ResponseEntity<>(userService.getAllUserInfoAndByKeyword(pageable, keyword), HttpStatus.OK);
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordForm forgotPasswordForm){
        return new ResponseEntity<>(userService.forgotPassword(forgotPasswordForm), HttpStatus.OK);
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam("code") String code,
                                           @RequestBody ResetPasswordForm resetPasswordForm){
        return new ResponseEntity<>(userService.resetPassword(code, resetPasswordForm), HttpStatus.OK);
    }

    @GetMapping("")
    public ResponseEntity<String> getUserFromJwt(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        return new  ResponseEntity(username, HttpStatus.OK);
    }

    @PutMapping("/change-password")
    public ResponseEntity<ResponseMessage> changePassword(HttpServletRequest request,
                                                          @RequestBody ChangePasswordForm changePasswordForm) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return new ResponseEntity(userService.changePassword(username, changePasswordForm), HttpStatus.OK);
    }

//    @DeleteMapping("/admin/delete/{userId}")
//    public ResponseEntity<ResponseMessage> deleteUserByUsername(@PathVariable("userId") Long userId) {
//        return new ResponseEntity<>(userService.deleteUserHardById(userId), HttpStatus.OK);
//    }
    @PutMapping("/admin/block/{id}")
    public ResponseEntity<ResponseMessage> blockUser(@PathVariable String id) {
        return new ResponseEntity<>(userService.blockUser(Long.parseLong(id)), HttpStatus.OK);
    }

    @GetMapping("/get/profile")
    public ResponseEntity<UserProfile> getProfile(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return new ResponseEntity<>(userService.getProfile(username), HttpStatus.OK);
    }

    @PutMapping("/update-profile")
    public ResponseEntity<ResponseMessage> updateProfile(@ModelAttribute UpdateProfile updateProfile,
                                                         HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return new ResponseEntity<>(userService.updateProfile(updateProfile, username), HttpStatus.OK);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}