package com.dan.dalat.services;

import com.dan.dalat.dtos.requests.ChangePasswordForm;
import com.dan.dalat.dtos.requests.ForgotPasswordForm;
import com.dan.dalat.dtos.requests.ResetPasswordForm;
import com.dan.dalat.dtos.requests.UpdateProfile;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.dtos.responses.UserAllInfo;
import com.dan.dalat.dtos.responses.UserDetail;
import com.dan.dalat.dtos.responses.UserProfile;
import com.dan.dalat.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.time.Instant;
import java.util.List;

public interface UserService extends UserDetailsService {
    User createUser(User user);
    User createUserByAdmin(User user);
//    User updateUserByAdmin(Long id, UpdateUserByAdminRequest updateUserByAdminRequest);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Page<User> searchByKeyword(String keyword, Pageable pageable);

    boolean verify(String verificationCode);

    boolean isEnableUser(String username);

    ResponseMessage changePassword(String username, ChangePasswordForm changePasswordForm);

    ResponseMessage forgotPassword(ForgotPasswordForm forgotPasswordForm);

    User getUserByResetPasswordToken(String resetPasswordToken);

    ResponseMessage resetPassword(String resetPasswordToken, ResetPasswordForm resetPasswordForm);

    ResponseMessage deleteUser(String username);
    List<User> findAllByDeletedAtBefore(Instant time);
    Page<User> getAllUserAndByKeyword(Pageable pageable, String keyword);
    Page<UserAllInfo> getAllUserInfoAndByKeyword(Pageable pageable, String keyword);
    UserDetail getUserById(Long id);
    ResponseMessage updateProfile(UpdateProfile updateProfile, String username);
    UserProfile getProfile(String username);
    ResponseMessage blockUser(Long id);
}
