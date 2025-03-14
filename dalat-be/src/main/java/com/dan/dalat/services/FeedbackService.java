package com.dan.dalat.services;

import com.dan.dalat.dtos.requests.UserFeedbackRequest;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.UserFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedbackService {
    UserFeedback create(UserFeedbackRequest userFeedbackRequest, String username);
    ResponseMessage delete(Long id);
    Page<UserFeedback> getFeedbacks(Long placeId, Pageable pageable);
}
