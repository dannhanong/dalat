package com.dan.dalat.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDayResponse {
    private Long id;
    private Long itineraryId;
    private Integer dayNumber;
    private String description;
    private Integer dayCost;
    private List<ItemResponse> items = new ArrayList<>();
}