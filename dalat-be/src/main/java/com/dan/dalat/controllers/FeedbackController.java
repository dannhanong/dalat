package com.dan.dalat.controllers;

import com.dan.dalat.dtos.requests.UserFeedbackRequest;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.UserFeedback;
import com.dan.dalat.security.jwt.JwtService;
import com.dan.dalat.services.FeedbackService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feedbacks")
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;
    @Autowired
    private JwtService jwtService;

    @GetMapping("/public/all/{placeId}")
    public ResponseEntity<Page<UserFeedback>> getAllFeedbacks(@RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "10") int size,
                                                              @RequestParam(defaultValue = "id") String sortBy,
                                                              @RequestParam(defaultValue = "desc") String order,
                                                              @PathVariable Long placeId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(order), sortBy));
        return ResponseEntity.ok(feedbackService.getFeedbacks(placeId, pageable));
    }

    @PostMapping("/private/create")
    public ResponseEntity<UserFeedback> createFeedback(HttpServletRequest request,
                                                       @RequestBody UserFeedbackRequest userFeedbackRequest) {
        String token = getTokenFromRequest(request);
        String username = jwtService.getUsernameFromToken(token);
        return ResponseEntity.ok(feedbackService.create(userFeedbackRequest, username));
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<ResponseMessage> deleteFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.delete(id));
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}
