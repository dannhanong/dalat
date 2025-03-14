package com.dan.dalat.controllers;

import com.dan.dalat.dtos.requests.AddPlaceToItineraryRequest;
import com.dan.dalat.dtos.requests.ItineraryRequest;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.dtos.responses.TravelDetalPlacePlanResponse;
import com.dan.dalat.models.Itinerary;
import com.dan.dalat.security.jwt.JwtService;
import com.dan.dalat.services.ItineraryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/itineraries")
public class ItineraryController {
    @Autowired
    private ItineraryService itineraryService;
    @Autowired
    private JwtService jwtService;

    // @GetMapping
    // public List<Itinerary> getAllItineraries() {
    //     return itineraryService.getAllItineraries();
    // }

    @GetMapping("/private/my-itineraries")
    public ResponseEntity<Page<Itinerary>> getItinerariesByUser(HttpServletRequest request,
                                                     @RequestParam(defaultValue = "") String keyword,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size,
                                                     @RequestParam(defaultValue = "id") String sortBy,
                                                     @RequestParam(defaultValue = "desc") String order) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(order), sortBy));
        return ResponseEntity.ok(itineraryService.getItineraries(keyword, pageable, username));
    }

    @PostMapping("/private/create")
    public Itinerary createItinerary(@RequestBody ItineraryRequest itineraryRequest,
                                     HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        return itineraryService.createItinerary(itineraryRequest, username);
    }

    @PutMapping("/private/update/{id}")
    public ResponseEntity<Itinerary> updateItinerary(@PathVariable Long id,
                                                     @RequestBody ItineraryRequest updatedItinerary,
                                                     HttpServletRequest request) {
        try {
            String token = getTokenFromRequest(request);
            String username = jwtService.getUsernameFromToken(token);
            return ResponseEntity.ok(itineraryService.updateItinerary(id, updatedItinerary, username));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // @PostMapping("/private/add-place/{id}")
    // public ResponseEntity<Itinerary> addPlaceToItinerary(@PathVariable Long id,
    //                                                      @RequestBody AddPlaceToItineraryRequest addPlaceToItineraryRequest) {
    //     return ResponseEntity.ok(itineraryService.addPlaceToItinerary(addPlaceToItineraryRequest.getPlaceId(), id, addPlaceToItineraryRequest.getVisitTime()));
    // }

    @DeleteMapping("/private/delete/{id}")
    public ResponseEntity<ResponseMessage> deleteItinerary(@PathVariable Long id,
                                                           HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        return ResponseEntity.ok(itineraryService.deleteItinerary(id, username));
    }

    @GetMapping("/private/{id}")
    public ResponseEntity<List<TravelDetalPlacePlanResponse>> getTravelPlan(@PathVariable Long id) {
        return ResponseEntity.ok(itineraryService.getTravelPlan(id));
    }

    @DeleteMapping("/private/remove-place/{itemId}")
    public ResponseEntity<ResponseMessage> removePlaceFromItinerary(@PathVariable Long itemId) {
        return ResponseEntity.ok(itineraryService.removePlaceFromItinerary(itemId));
    }

    @DeleteMapping("/private/remove-day/{dayId}")
    public ResponseEntity<ResponseMessage> removeDayFromItinerary(@PathVariable Long dayId) {
        return ResponseEntity.ok(itineraryService.removeDayFromItinerary(dayId));
    }

    @PutMapping("/private/add-place/{dayId}")
    public ResponseEntity<ResponseMessage> addPlaceToItinerary(@PathVariable Long dayId,
                                                              @RequestBody AddPlaceToItineraryRequest addPlaceToItineraryRequest,
                                                              HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        return ResponseEntity.ok(itineraryService.addPlaceToItinerary(dayId, addPlaceToItineraryRequest, username));
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}