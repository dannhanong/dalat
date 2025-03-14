package com.dan.dalat.dtos.responses;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.dan.dalat.models.Category;
import com.dan.dalat.models.Hobby;
import com.dan.dalat.models.TourismService;
import com.dan.dalat.models.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PlaceRecommendResponse {
    Long id;
    String name;
    Category category;
    String address;
    BigDecimal latitude;
    BigDecimal longitude;
    Double rating;
    String description;
    String imageCode;
    List<String> otherImages;
    boolean show;
    Integer childFare;
    Integer adultFare;
    User creator;
    LocalTime openTime;
    LocalTime closeTime;
    Set<Hobby> hobbies = new HashSet<>();
    Set<TourismService> services = new HashSet<>();
    boolean wishlisted;
}
