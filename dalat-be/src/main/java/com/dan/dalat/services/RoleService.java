package com.dan.dalat.services;

import com.dan.dalat.enums.RoleName;
import com.dan.dalat.models.Role;

public interface RoleService {
    Role findByName(RoleName name);
}
