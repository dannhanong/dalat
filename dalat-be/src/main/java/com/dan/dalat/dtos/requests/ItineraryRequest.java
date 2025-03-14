package com.dan.dalat.dtos.requests;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private String title;
    private String description;
    private List<ItineraryDayRequest> days;
    Integer totalAdults;
    Integer totalChildren;
}
