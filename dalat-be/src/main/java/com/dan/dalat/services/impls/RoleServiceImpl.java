package com.dan.dalat.services.impls;

import com.dan.dalat.enums.RoleName;
import com.dan.dalat.models.Role;
import com.dan.dalat.repositories.RoleRepository;
import com.dan.dalat.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl implements RoleService {
    @Autowired
    private RoleRepository roleRepository;

    @Override
    public Role findByName(RoleName name) {
        return roleRepository.findByName(name);
    }
}
