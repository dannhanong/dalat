package com.dan.dalat.controllers;

import com.dan.dalat.dtos.requests.TourismServiceRequest;
import com.dan.dalat.dtos.requests.TravelPlanRequest;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.dtos.responses.TravelDetalPlacePlanResponse;
import com.dan.dalat.models.TourismService;
import com.dan.dalat.security.jwt.JwtService;
import com.dan.dalat.services.TourismServiceService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/services")
public class TourismServiceController {
    @Autowired
    private TourismServiceService tourismServiceService;
    @Autowired
    private JwtService jwtService;

    @GetMapping("/public/all")
    public ResponseEntity<List<TourismService>> getAllServices() {
        return ResponseEntity.ok(tourismServiceService.getAll());
    }

    @PostMapping("/admin/create")
    public ResponseEntity<TourismService> createService(@RequestBody TourismServiceRequest service) {
        return ResponseEntity.ok(tourismServiceService.create(service));
    }

    @PutMapping("/admin/update/{id}")
    public ResponseEntity<TourismService> updateService(@PathVariable Long id, @RequestBody TourismServiceRequest updatedService) {
        return ResponseEntity.ok(tourismServiceService.update(updatedService, id));
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<ResponseMessage> deleteService(@PathVariable Long id) {
        return ResponseEntity.ok(tourismServiceService.delete(id));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<TourismService> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(tourismServiceService.getById(id));
    }

    @GetMapping("/public/get-by-category/{categoryId}")
    public ResponseEntity<List<TourismService>> getServicesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(tourismServiceService.getServicesByCategory(categoryId));
    }

    @PostMapping("/private/travel-plan")
    public ResponseEntity<List<TravelDetalPlacePlanResponse>> getTravelPlan(HttpServletRequest request, 
                                                                            @RequestBody TravelPlanRequest travelPlanRequest) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        return ResponseEntity.ok(tourismServiceService.getTravelPlan(travelPlanRequest, username));
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}
