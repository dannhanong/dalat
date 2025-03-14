package com.dan.dalat.dtos.requests;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class RecommendRequest {
    Long userId;
    float userLat;
    float userLon;
    float maxDistance;
    int price;
    int topN;
    List<Long> categoryIds;
    List<Long> hobbyIds;
    List<Long> serviceIds;
    String keyword;
}
