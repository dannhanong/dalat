package com.dan.dalat.repositories;

import com.dan.dalat.models.TourismService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourismServiceRepository extends JpaRepository<TourismService, Long> {
    List<TourismService> findByCategory_Id(Long categoryId);
}