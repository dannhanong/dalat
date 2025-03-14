package com.dan.dalat.dtos.responses;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PlaceDetail {
    Long id;
    String name;
    String arrivalTime;
    String departureTime;
    Integer visitDurationMinutes;
    Float travelTimeMinutes;
    Integer totalCost;
}