package com.dan.dalat.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dan.dalat.models.ItineraryDay;

@Repository
public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, Long> {
    List<ItineraryDay> findByItinerary_IdOrderByDayNumberAsc(Long itineraryId);
    Optional<ItineraryDay> findByItinerary_IdAndDayNumber(Long itineraryId, Integer dayNumber);
    @Query("SELECT COUNT(d) FROM ItineraryDay d WHERE d.itinerary.id = :itineraryId")
    Integer countDaysByItineraryId(@Param("itineraryId") Long itineraryId);

    @Query("SELECT d FROM ItineraryDay d WHERE d.itinerary.id = :itineraryId " +
           "ORDER BY SIZE(d.items) DESC")
    List<ItineraryDay> findMostPopulatedDays(@Param("itineraryId") Long itineraryId, Pageable pageable);
    
    void deleteByItinerary_IdAndDayNumber(Long itineraryId, int dayNumber);
    List<ItineraryDay> findByItinerary_IdAndDayNumberGreaterThan(Long itineraryId, int dayNumber);

    int countByItinerary_Id(Long itineraryId);
}
