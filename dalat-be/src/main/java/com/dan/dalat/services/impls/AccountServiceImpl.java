package com.dan.dalat.services.impls;

import com.dan.dalat.dtos.requests.SignupForm;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.enums.RoleName;
import com.dan.dalat.models.Role;
import com.dan.dalat.models.User;
import com.dan.dalat.services.AccountService;
import com.dan.dalat.services.RoleService;
import com.dan.dalat.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@Transactional
public class AccountServiceImpl implements AccountService {
    @Autowired
    private UserService userService;
    @Autowired
    private RoleService roleService;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public ResponseMessage signupAccount(SignupForm signupForm) {
        if(userService.existsByUsername(signupForm.getUsername())){
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if(userService.existsByEmail(signupForm.getEmail())){
            throw new RuntimeException("Email đã tồn tại");
        }

        if (!signupForm.getPassword().equals(signupForm.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu không khớp");
        }

        User user = new User(signupForm.getName(), signupForm.getUsername(),
                passwordEncoder.encode(signupForm.getPassword()),
                signupForm.getEmail(), signupForm.getPhoneNumber());
        String strRoles = signupForm.getRoles();
        Set<Role> roles = new HashSet<>();
        if (strRoles == null){
            Role userRole = roleService.findByName(RoleName.USER);
            roles.add(userRole);
        }else {
            switch (strRoles){
                case "admin":
                    Role adminRole = roleService.findByName(RoleName.ADMIN);
                    Role adminUserRole = roleService.findByName(RoleName.USER);
                    roles.add(adminRole);
                    roles.add(adminUserRole);
                    break;
                case "user":
                    Role userRole = roleService.findByName(RoleName.USER);
                    roles.add(userRole);
                    break;
            }
        }
        user.setRoles(roles);

        User savedUser = userService.createUser(user);
        if (savedUser != null) {
            return new ResponseMessage(200, "Tạo tài khoản thành công");
        } else {
            throw new RuntimeException("Yêu cầu tạo tài khoản thất bại");
        }
    }

    @Override
    public ResponseMessage createAccountByAdmin(SignupForm signupForm) {
        if(userService.existsByUsername(signupForm.getUsername())){
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if(userService.existsByEmail(signupForm.getEmail())){
            throw new RuntimeException("Email đã tồn tại");
        }

        if (!signupForm.getPassword().equals(signupForm.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu không khớp");
        }

        User user = new User(signupForm.getName(), signupForm.getUsername(),
                passwordEncoder.encode(signupForm.getPassword()), signupForm.getEmail(), signupForm.getPhoneNumber());
        String strRoles = signupForm.getRoles();
        Set<Role> roles = new HashSet<>();
        if (strRoles == null){
            Role userRole = roleService.findByName(RoleName.USER);
            roles.add(userRole);
        }else {
            switch (strRoles){
                case "admin":
                    Role adminRole = roleService.findByName(RoleName.ADMIN);
                    Role adminUserRole = roleService.findByName(RoleName.USER);
                    roles.add(adminRole);
                    roles.add(adminUserRole);
                    break;
                case "user":
                    Role userRole = roleService.findByName(RoleName.USER);
                    roles.add(userRole);
                    break;
            }
        }
        user.setRoles(roles);

        userService.createUserByAdmin(user);

        return new ResponseMessage(200, "Tạo tài khoản thành công");
    }

//    @Override
//    public ResponseMessage updateAccountByAdmin(Long userId, UpdateUserByAdminRequest updateUserByAdminRequest) {
//        User updatedUser = userService.updateUserByAdmin(userId, updateUserByAdminRequest);
//        if (updatedUser != null) {
//            return new ResponseMessage(200, "Cập nhật thông tin tài khoản thành công");
//        } else {
//            throw new RuntimeException("Cập nhật thông tin tài khoản thất bại");
//        }
//    }
}
