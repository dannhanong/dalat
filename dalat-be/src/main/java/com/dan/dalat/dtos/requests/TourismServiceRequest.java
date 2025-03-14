package com.dan.dalat.dtos.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourismServiceRequest {
    private String name;
    private Long categoryId;
}
