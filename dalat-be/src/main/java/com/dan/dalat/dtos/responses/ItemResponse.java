package com.dan.dalat.dtos.responses;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {
    private Long id;
    private Long placeId;
    private String placeName;
    private String placeAddress;
    private String imageUrl;
    private Integer adultFare;
    private LocalDateTime visitTime;
    private Integer durationMinutes;
    private Integer distanceFromPrevious;
    private Integer travelTimeFromPrevious;
    private String transportMode;
    private String notes;
}