package com.dan.dalat.dtos.requests;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddPlaceToItineraryRequest {
    private Long placeId;
    private LocalDateTime visitTime;
    private LocalDateTime leaveTime;
}
