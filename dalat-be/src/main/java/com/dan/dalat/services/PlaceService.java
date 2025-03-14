package com.dan.dalat.services;

import com.dan.dalat.dtos.requests.PlaceRequest;
import com.dan.dalat.dtos.requests.RecommendRequest;
import com.dan.dalat.dtos.responses.LocationResponse;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Place;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PlaceService {
    Place createPlace(PlaceRequest placeRequest, String username);
    Place updatePlace(Long placeId, PlaceRequest placeRequest);
    ResponseMessage deletePlace(Long placeId);
    Place getPlaceById(Long placeId);
    Page<Place> getAllPlaces(String keyword, Pageable pageable);
    List<Place> getAllPlaces();
    Place updateShowPlace(Long placeId);
    Page<Place> getPlacesRecommend(RecommendRequest recommendRequest, Pageable pageable, String username);
    LocationResponse lookupPlace(String keyword);
}
