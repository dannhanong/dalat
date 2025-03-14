package com.dan.dalat.repositories;

import com.dan.dalat.models.Hobby;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HobbyRepository extends JpaRepository<Hobby, Long> {
    boolean existsById(Long id);
}
