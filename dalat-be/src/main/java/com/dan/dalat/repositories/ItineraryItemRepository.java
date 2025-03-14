package com.dan.dalat.repositories;

import com.dan.dalat.models.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    List<ItineraryItem> findByDay_IdOrderByVisitTimeAsc(Long dayId);
    @Query("SELECT item FROM ItineraryItem item WHERE item.day.itinerary.id = :itineraryId ORDER BY item.day.dayNumber, item.visitTime")
    List<ItineraryItem> findAllByItineraryId(@Param("itineraryId") Long itineraryId);
    List<ItineraryItem> findByPlace_Id(Long placeId);
    
    @Query("SELECT COUNT(i) FROM ItineraryItem i WHERE i.place.id = :placeId")
    Long countByPlaceId(@Param("placeId") Long placeId);

    int countByDay_Itinerary_IdAndPlaceIsNotNull(Long itineraryId);
    int countByDay_Id(Long dayId);

    //delete by id
    @Modifying
    @Transactional
    @Query("DELETE FROM ItineraryItem i WHERE i.id = :id")
    void deleteItemById(@Param("id") Long id);
}