package com.dan.dalat.controllers;

import com.dan.dalat.dtos.requests.PlaceLookup;
import com.dan.dalat.dtos.requests.PlaceRequest;
import com.dan.dalat.dtos.requests.RecommendRequest;
import com.dan.dalat.dtos.responses.LocationResponse;
import com.dan.dalat.dtos.responses.PlaceRecommendResponse;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Place;
import com.dan.dalat.security.jwt.JwtService;
import com.dan.dalat.services.PlaceService;
import com.dan.dalat.services.WishlistService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("/places")
public class PlaceController {
    @Autowired
    private PlaceService placeService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/public/all")
    public ResponseEntity<Page<Place>> getAllPlaces(@RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(order), sortBy));
        return ResponseEntity.ok(placeService.getAllPlaces(keyword, pageable));
    }

    @GetMapping("/public/get-all")
    public ResponseEntity<List<Place>> getAll() {
        return ResponseEntity.ok(placeService.getAllPlaces());
    }

    @PostMapping("/private/create")
    public ResponseEntity<Place> createPlace(@ModelAttribute PlaceRequest placeRequest, HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        placeRequest.setShow(jwtService.getRolesFromToken(token).contains("ADMIN"));
        return ResponseEntity.ok(placeService.createPlace(placeRequest, username));
    }

    @PutMapping("/private/update/{id}")
    public ResponseEntity<Place> updatePlace(@PathVariable Long id, @ModelAttribute PlaceRequest placeRequest) {
        return ResponseEntity.ok(placeService.updatePlace(id, placeRequest));
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<ResponseMessage> deletePlace(@PathVariable Long id) {
        return new ResponseEntity<>(placeService.deletePlace(id),
                placeService.deletePlace(id).getStatus() == 200 ? OK : BAD_REQUEST);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Place> getPlaceById(@PathVariable Long id) {
        return ResponseEntity.ok(placeService.getPlaceById(id));
    }

    @PutMapping("/admin/update-show/{id}")
    public ResponseEntity<Place> updateShowPlace(@PathVariable Long id) {
        return ResponseEntity.ok(placeService.updateShowPlace(id));
    }

    @PostMapping("/public/get-place-recommend")
    public ResponseEntity<Page<PlaceRecommendResponse>> getPlaceRecommend(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestBody RecommendRequest recommendRequest,
            HttpServletRequest request) {
        Pageable pageable = PageRequest.of(page, size);
        String token = getTokenFromRequest(request);
        String username = token != null ? jwtService.getUsernameFromToken(token) : null;

        // Giả sử placeService.getPlacesRecommend trả về Page<Place>
        Page<Place> places = placeService.getPlacesRecommend(recommendRequest, pageable, username);

        // Chuyển đổi Page<Place> thành Page<PlaceRecommendResponse>
        Page<PlaceRecommendResponse> responsePage = places.map(place -> PlaceRecommendResponse.builder()
                .id(place.getId())
                .name(place.getName())
                .category(place.getCategory())
                .address(place.getAddress())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .rating(place.getRating())
                .description(place.getDescription())
                .imageCode(place.getImageCode())
                .otherImages(place.getOtherImages())
                .show(place.isShow())
                .childFare(place.getChildFare())
                .adultFare(place.getAdultFare())
                .creator(place.getCreator())
                .openTime(place.getOpenTime())
                .closeTime(place.getCloseTime())
                .hobbies(place.getHobbies())
                .services(place.getServices())
                .wishlisted(wishlistService.isWishlisted(place.getId(), username))
                .build());

        return ResponseEntity.ok(responsePage);
    }

    @PostMapping("/private/look-up")
    public ResponseEntity<LocationResponse> lookUpPlace(@RequestBody PlaceLookup placeLookup) {
        return ResponseEntity.ok(placeService.lookupPlace(placeLookup.getPlaceName()));
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
