package com.dan.dalat.repositories;

import com.dan.dalat.models.UserFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {
    Page<UserFeedback> findByPlace_Id(Long placeId, Pageable pageable);
}
