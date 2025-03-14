package com.dan.dalat.services;

import com.dan.dalat.dtos.requests.TourismServiceRequest;
import com.dan.dalat.dtos.requests.TravelPlanRequest;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.dtos.responses.TravelDetalPlacePlanResponse;
import com.dan.dalat.models.TourismService;

import java.util.List;

public interface TourismServiceService {
    List<TourismService> getAll();
    TourismService create(TourismServiceRequest tourismServiceRequest);
    TourismService update(TourismServiceRequest tourismServiceRequest, Long id);
    ResponseMessage delete(Long id);
    TourismService getById(Long id);
    List<TourismService> getServicesByCategory(Long categoryId);
    List<TravelDetalPlacePlanResponse> getTravelPlan(TravelPlanRequest travelPlanRequest, String username);
}
