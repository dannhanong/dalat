package com.dan.dalat.dtos.requests;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDayRequest {
    private Integer dayNumber;
    private String description;
    private LocalDate date;
    private List<ItemRequest> items;
}