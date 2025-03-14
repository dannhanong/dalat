package com.dan.dalat.services;

import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Festival;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface FestivalService {
    Page<Festival> getFestivals(String keyword, Pageable pageable);
    Festival createFestival(Festival festival);
    Festival updateFestival(Long id, Festival festival);
    ResponseMessage deleteFestival(Long id);
    Festival getFestivalById(Long id);
    Map<LocalDate, List<Festival>> getFestivalsGroupedByDate();
    Map<LocalDate, List<Festival>> getFestivalsByDateRange(LocalDate startDate, LocalDate endDate);
}
