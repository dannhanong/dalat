package com.dan.dalat.repositories;

import com.dan.dalat.enums.RoleName;
import com.dan.dalat.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByName(RoleName name);
    boolean existsByName(RoleName name);
}
