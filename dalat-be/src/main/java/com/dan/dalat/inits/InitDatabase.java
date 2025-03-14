package com.dan.dalat.inits;

import com.dan.dalat.enums.RoleName;
import com.dan.dalat.models.Hobby;
import com.dan.dalat.models.Role;
import com.dan.dalat.repositories.HobbyRepository;
import com.dan.dalat.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InitDatabase {
    @Bean
    CommandLineRunner initRole(RoleRepository roleRepository) {
        return args -> {
            if (!roleRepository.existsByName(RoleName.ADMIN)) {
                Role adminRole = new Role();
                adminRole.setName(RoleName.ADMIN);
                roleRepository.save(adminRole);
            }
            if (!roleRepository.existsByName(RoleName.USER)) {
                Role userRole = new Role();
                userRole.setName(RoleName.USER);
                roleRepository.save(userRole);
            }
        };
    }

    @Bean
    CommandLineRunner initHobby(HobbyRepository hobbyRepository) {
        return args -> {
            if (hobbyRepository.findById(1L).isEmpty()) {
                Hobby hobby = new Hobby();
                hobby.setName("Khám phá thiên nhiên");
                hobbyRepository.save(hobby);
            }
            if (hobbyRepository.findById(2L).isEmpty()) {
                Hobby hobby = new Hobby();
                hobby.setName("Tham quan văn hóa & lịch sử");
                hobbyRepository.save(hobby);
            }
            if (hobbyRepository.findById(3L).isEmpty()) {
                Hobby hobby = new Hobby();
                hobby.setName("Thư giãn & giải trí");
                hobbyRepository.save(hobby);
            }
            if (hobbyRepository.findById(4L).isEmpty()) {
                Hobby hobby = new Hobby();
                hobby.setName("Thể thao & vận động");
                hobbyRepository.save(hobby);
            }
            if (hobbyRepository.findById(5L).isEmpty()) {
                Hobby hobby = new Hobby();
                hobby.setName("Mua sắm & ẩm thực");
                hobbyRepository.save(hobby);
            }
        };
    }
}
