package com.dan.dalat.dtos.responses;

import java.util.List;

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
public class TravelDetalPlacePlanResponse {
    int day;
    Long dayId;
    String date;
    List<PlaceWithTimeInfo> places;
    int dailyCost;
    int totalAdults;
    int toalChildren;
}
