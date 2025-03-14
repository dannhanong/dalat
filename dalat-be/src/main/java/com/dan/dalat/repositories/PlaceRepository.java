package com.dan.dalat.repositories;

import com.dan.dalat.models.Place;
import com.dan.dalat.models.TourismService;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {
    Page<Place> findByNameContainingOrCategory_NameContaining(String placeName, String categoryName, Pageable pageable);
    List<Place> findByCategory_Id(Long categoryId);
    List<Place> findByServicesContaining(TourismService tourismService);

    @Modifying
    @Query(value = "DELETE FROM place_service WHERE service_id = :serviceId", nativeQuery = true)
    void deleteAllPlaceServiceByServiceId(@Param("serviceId") Long serviceId);
}
