package com.dan.dalat.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "itineraries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Itinerary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String title;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    @JsonIgnore
    List<ItineraryDay> days = new ArrayList<>();

    LocalDate startDate;
    LocalDate endDate;

    Integer totalDays;

    Integer totalCost;
    Integer totalPlaces;

    Integer totalAdults;
    Integer totalChildren;

    public Integer getCalculatedTotalDays() {
        if (startDate != null && endDate != null) {
            return (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
        return days.size();
    }
    
    // Thêm phương thức để tự động cập nhật totalDays trước khi lưu
    @PrePersist
    @PreUpdate
    public void updateTotalDays() {
        this.totalDays = getCalculatedTotalDays();
    }
}