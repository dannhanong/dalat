package com.dan.dalat.controllers;

import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Festival;
import com.dan.dalat.services.FestivalService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/festivals")
public class FestivalController {
    @Autowired
    private FestivalService festivalService;

    @GetMapping("/public/all")
    public ResponseEntity<Page<Festival>> getAllFestivals(@RequestParam(defaultValue = "") String keyword,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size,
                                                          @RequestParam(defaultValue = "id") String sortBy,
                                                          @RequestParam(defaultValue = "desc") String order) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(order), sortBy));
        return ResponseEntity.ok(festivalService.getFestivals(keyword, pageable));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Festival> getFestivalById(@PathVariable Long id) {
        return ResponseEntity.ok(festivalService.getFestivalById(id));
    }

    @PostMapping("/admin/create")
    public ResponseEntity<Festival> createFestival(@RequestBody Festival festival) {
        return ResponseEntity.ok(festivalService.createFestival(festival));
    }

    @PutMapping("/admin/update/{id}")
    public ResponseEntity<Festival> updateFestival(@PathVariable Long id, @RequestBody Festival updatedFestival) {
        return ResponseEntity.ok(festivalService.updateFestival(id, updatedFestival));
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<ResponseMessage> deleteFestival(@PathVariable Long id) {
        return ResponseEntity.ok(festivalService.deleteFestival(id));
    }

    @GetMapping("/public/grouped")
    public ResponseEntity<Map<LocalDate, List<Festival>>> getFestivalsGroupedByDate() {
        Map<LocalDate, List<Festival>> groupedFestivals = festivalService.getFestivalsGroupedByDate();
        return ResponseEntity.ok(groupedFestivals);
    }

    @GetMapping("/public/by-date/grouped")
    public ResponseEntity<Map<LocalDate, List<Festival>>> getFestivalsByDateRangeGrouped(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<LocalDate, List<Festival>> festivals = festivalService.getFestivalsByDateRange(startDate, endDate);
        return ResponseEntity.ok(festivals);
    }
}
