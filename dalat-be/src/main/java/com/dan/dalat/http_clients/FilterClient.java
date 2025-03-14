package com.dan.dalat.http_clients;

import com.dan.dalat.dtos.requests.RecommendRequest;
import com.dan.dalat.dtos.requests.TravelPlanRequest;
import com.dan.dalat.dtos.responses.RecommendResponse;
import com.dan.dalat.dtos.responses.TravelPlanResponse;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "filter-service", url = "http://localhost:8000")
public interface FilterClient {
    @PostMapping(value = "/recommendations")
    List<RecommendResponse> getRecommendations(@RequestParam int page,
                                               @RequestParam int size,
                                               @RequestBody RecommendRequest recommendRequest);

    @PostMapping(value = "/travel-plan")
    List<TravelPlanResponse> getTravelPlan(@RequestBody TravelPlanRequest travelPlanRequest);
}
