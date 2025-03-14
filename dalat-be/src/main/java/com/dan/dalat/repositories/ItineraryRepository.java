package com.dan.dalat.repositories;

import com.dan.dalat.models.Itinerary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByUser_Username(String username);
    Page<Itinerary> findByUser_UsernameAndTitleContainingIgnoreCase(String username, String title, Pageable pageable);
    List<Itinerary> findByTotalDaysGreaterThanEqual(Integer minDays);
    @Query("SELECT COUNT(i) FROM Itinerary i WHERE i.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
}

