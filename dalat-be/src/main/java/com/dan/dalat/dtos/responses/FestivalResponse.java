package com.dan.dalat.dtos.responses;

import java.time.LocalDate;
import java.util.List;

import com.dan.dalat.models.Festival;

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
public class FestivalResponse {
    LocalDate startDate;
    List<Festival> festivals;
}
