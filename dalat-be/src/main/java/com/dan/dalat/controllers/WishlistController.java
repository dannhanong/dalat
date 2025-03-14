package com.dan.dalat.controllers;

import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Wishlist;
import com.dan.dalat.security.jwt.JwtService;
import com.dan.dalat.services.WishlistService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {
    @Autowired
    private WishlistService wishlistService;
    @Autowired
    private JwtService jwtService;

    @GetMapping("/private/my-wishlist")
    public ResponseEntity<Page<Wishlist>> getWishlistByUser(HttpServletRequest request,
                                                            @RequestParam(defaultValue = "") String keyword,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size,
                                                            @RequestParam(defaultValue = "id") String sortBy,
                                                            @RequestParam(defaultValue = "desc") String order) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(order), sortBy));
        return ResponseEntity.ok(wishlistService.getWishlist(username, keyword, pageable));
    }

    @PostMapping("/private/add/{placeId}")
    public Wishlist addPlaceToWishlist(@PathVariable Long placeId,
                                       HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        return wishlistService.create(placeId, username);
    }

    @DeleteMapping("/private/delete/{id}")
    public ResponseEntity<ResponseMessage> deleteWishlist(@PathVariable Long id,
                                                          HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        return ResponseEntity.ok(wishlistService.delete(id, username));
    }

    @GetMapping("/private/{id}")
    public ResponseEntity<Wishlist> getWishlistById(@PathVariable Long id) {
        return ResponseEntity.ok(wishlistService.getWishList(id));
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}
