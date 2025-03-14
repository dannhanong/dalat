package com.dan.dalat.dtos.responses;

import com.dan.dalat.models.Place;
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
public class PlaceWithTimeInfo extends Place {
    Long itemId;
    String arrivalTime;
    String departureTime;
    Integer visitDurationMinutes;
    Float travelTimeMinutes;
    Integer totalCost;
    
    public PlaceWithTimeInfo(Place place) {
        super();
        this.setId(place.getId());
        this.setName(place.getName());
        this.setDescription(place.getDescription());
        this.setLatitude(place.getLatitude());
        this.setLongitude(place.getLongitude());
        this.setAdultFare(place.getAdultFare());
        this.setChildFare(place.getChildFare());
        this.setImageCode(place.getImageCode());
        this.setOtherImages(place.getOtherImages());
        this.setCategory(place.getCategory());
        this.setHobbies(place.getHobbies());
        this.setServices(place.getServices());
    }
}