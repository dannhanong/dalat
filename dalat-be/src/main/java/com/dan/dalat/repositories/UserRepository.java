package com.dan.dalat.repositories;

import com.dan.dalat.models.Role;
import com.dan.dalat.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    User findByUsername(String username);
    User findByEmail(String email);
    User findByResetPasswordToken(String resetPasswordToken);

    User findByVerificationCode(String code);

    @Transactional
    @Query("UPDATE User u SET u.enabled = true WHERE u.id = :id")
    public void enableUser(String id);

    List<User> findAllByDeletedAtBefore(Instant sevenDaysAgo);
    List<User> findAllByCreatedAtBeforeAndEnabled(LocalDateTime twoDaysAgo, boolean enabled);
    List<User> findByRoles(Role role);
    @Query("SELECT u FROM User u WHERE CONCAT(u.name, ' ', u.username, ' ', u.email) LIKE %:keyword%")
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    @Query("SELECT u FROM User u WHERE CONCAT(u.name, ' ', u.username, ' ', u.email) LIKE %:keyword%")
    List<User> lSearchByKeyword(@Param("keyword") String keyword);
}
