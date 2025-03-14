package com.dan.dalat.dtos.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFeedbackRequest {
    private Long placeId;
    private int rating;
    private String comment;
}
