package com.dan.dalat.services.impls;

import com.dan.dalat.dtos.requests.UserFeedbackRequest;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Place;
import com.dan.dalat.models.User;
import com.dan.dalat.models.UserFeedback;
import com.dan.dalat.repositories.PlaceRepository;
import com.dan.dalat.repositories.UserFeedbackRepository;
import com.dan.dalat.repositories.UserRepository;
import com.dan.dalat.services.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FeedbackServiceImpl implements FeedbackService {
    @Autowired
    private UserFeedbackRepository userFeedbackRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PlaceRepository placeRepository;

    @Override
    public UserFeedback create(UserFeedbackRequest userFeedbackRequest, String username) {
        User user = userRepository.findByUsername(username);
        Place place = placeRepository.findById(userFeedbackRequest.getPlaceId()).orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));
        UserFeedback userFeedback = new UserFeedback();
        userFeedback.setUser(user);
        userFeedback.setPlace(place);
        userFeedback.setComment(userFeedbackRequest.getComment());
        userFeedback.setRating(userFeedbackRequest.getRating());
        userFeedback.setCreatedAt(LocalDateTime.now());

        return userFeedbackRepository.save(userFeedback);
    }

    @Override
    public ResponseMessage delete(Long id) {
        return userFeedbackRepository.findById(id).map(userFeedback -> {
            userFeedbackRepository.delete(userFeedback);
            return new ResponseMessage(200, "Xóa feedback thành công");
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy feedback"));
    }

    @Override
    public Page<UserFeedback> getFeedbacks(Long placeId, Pageable pageable) {
        return userFeedbackRepository.findByPlace_Id(placeId, pageable);
    }
}
