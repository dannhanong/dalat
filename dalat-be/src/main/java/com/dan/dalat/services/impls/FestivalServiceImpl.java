package com.dan.dalat.services.impls;

import com.dan.dalat.dtos.responses.FestivalResponse;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Festival;
import com.dan.dalat.repositories.FestivalRepository;
import com.dan.dalat.services.FestivalService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class FestivalServiceImpl implements FestivalService {
    @Autowired
    private FestivalRepository festivalRepository;

    @Override
    public Page<Festival> getFestivals(String keyword, Pageable pageable) {
        return festivalRepository.findByNameContainingIgnoreCase(keyword, pageable);
    }

    @Override
    public Festival createFestival(Festival festival) {
        return festivalRepository.save(festival);
    }

    @Override
    public Festival updateFestival(Long id, Festival festival) {
        return festivalRepository.findById(id).map(f -> {
            f.setName(festival.getName());
            f.setStartDate(festival.getStartDate());
            f.setDescription(festival.getDescription());
            return festivalRepository.save(f);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hội"));
    }

    @Override
    public ResponseMessage deleteFestival(Long id) {
        return festivalRepository.findById(id).map(festival -> {
            festivalRepository.delete(festival);
            return new ResponseMessage(200, "Xóa lịch hội thành công");
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hội"));
    }

    @Override
    public Festival getFestivalById(Long id) {
        return festivalRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hội"));
    }

    @Override
    public Map<LocalDate, List<Festival>> getFestivalsGroupedByDate() {
        List<Festival> allFestivals = festivalRepository.findAllByOrderByStartDateAsc();
        Map<LocalDate, List<Festival>> groupedFestivals = allFestivals.stream()
                .collect(Collectors.groupingBy(
                        Festival::getStartDate,
                        Collectors.toList()));
        return groupedFestivals;
    }

    @Override
    public Map<LocalDate, List<Festival>> getFestivalsByDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        
        if (endDate == null) {
            endDate = startDate.plusMonths(1); // Mặc định lấy 1 tháng từ ngày bắt đầu
        }
        
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        
        // Lấy festival trong khoảng thời gian
        List<Festival> festivals = festivalRepository.findByStartDateBetweenOrderByStartDateAsc(startDate, endDate);
        
        // Nhóm festival theo ngày
        Map<LocalDate, List<Festival>> groupedFestivals = festivals.stream()
                .collect(Collectors.groupingBy(
                        Festival::getStartDate,
                        Collectors.toList()));
        
        return groupedFestivals;
    }
}
