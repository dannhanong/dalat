package com.dan.dalat.dtos.requests;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PlaceRequest {
    String name;
    Long categoryId;
    String address;
    BigDecimal latitude;
    BigDecimal longitude;
    String description;
    MultipartFile image;
    List<MultipartFile> images;
    boolean show;
    Integer childFare = 0;
    Integer adultFare = 0;
    LocalTime openTime;
    LocalTime closeTime;
    Set<Long> hobbyIds;
    Set<Long> serviceIds;
}
