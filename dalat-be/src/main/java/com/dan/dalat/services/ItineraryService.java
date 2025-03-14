package com.dan.dalat.services;

import com.dan.dalat.dtos.requests.AddPlaceToItineraryRequest;
import com.dan.dalat.dtos.requests.ItineraryRequest;
import com.dan.dalat.dtos.requests.TravelPlanRequest;
import com.dan.dalat.dtos.responses.ItineraryDayResponse;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.dtos.responses.TravelDetalPlacePlanResponse;
import com.dan.dalat.models.Itinerary;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ItineraryService {
    // Lấy tất cả các ngày của một hành trình
    // List<ItineraryDayResponse> getDaysByItineraryId(Long itineraryId);
    
    // Lấy chi tiết một ngày
    // ItineraryDayResponse getDayById(Long dayId);
    Itinerary createItinerary(ItineraryRequest request, String username);
    
    // Cập nhật thông tin của một ngày
    Itinerary updateItinerary(Long id, ItineraryRequest request, String username);
    
    // Hoán đổi vị trí của hai ngày
    // ResponseMessage swapDays(Long itineraryId, Integer day1Number, Integer day2Number, Long userId);
    ResponseMessage deleteItinerary(Long id, String username);
    // Itinerary recalculateTotals(Long itineraryId);
    Page<Itinerary> getItineraries(String keyword, Pageable pageable, String username);
    List<TravelDetalPlacePlanResponse> getTravelPlan(Long id);
    ResponseMessage addPlaceToItinerary(Long dayId, AddPlaceToItineraryRequest addPlaceToItineraryRequest, String username);
    ResponseMessage removePlaceFromItinerary(Long itemId);
    ResponseMessage removeDayFromItinerary(Long dayId);
}
