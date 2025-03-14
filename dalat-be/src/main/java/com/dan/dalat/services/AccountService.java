package com.dan.dalat.services;

import com.dan.dalat.dtos.requests.SignupForm;
import com.dan.dalat.dtos.responses.ResponseMessage;

public interface AccountService {
    ResponseMessage signupAccount(SignupForm signupForm);
    ResponseMessage createAccountByAdmin(SignupForm signupForm);
//    ResponseMessage updateAccountByAdmin(Long userId, UpdateUserByAdminRequest updateUserByAdminRequest);
}
