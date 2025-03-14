package com.dan.dalat.repositories;

import com.dan.dalat.models.Festival;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FestivalRepository extends JpaRepository<Festival, Long> {
    Page<Festival> findByNameContainingIgnoreCase(String name, Pageable pageable);
    List<Festival> findByStartDateBetweenOrderByStartDateAsc(LocalDate startDate, LocalDate endDate);
    List<Festival> findAllByOrderByStartDateAsc();
}
