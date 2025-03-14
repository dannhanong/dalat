package com.dan.dalat.dtos.requests;

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
public class TravelPlanRequest {
    Long userId;
    float userLat;
    float userLon;
    int numDays;
    int budget;
    int numAdults;
    int numChildren;
    float maxDistance;
    List<Long> categoryIds;
    List<Long> hobbyIds;
    List<Long> serviceIds;
    String startDate; // Thêm ngày bắt đầu
    String startTime = "08:00"; // Thời gian bắt đầu mỗi ngày, mặc định 08:00
}