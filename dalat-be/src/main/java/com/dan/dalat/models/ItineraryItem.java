package com.dan.dalat.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "itinerary_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ItineraryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "day_id")
    @JsonIgnore
    ItineraryDay day;

    @ManyToOne
    @JoinColumn(name = "place_id")
    Place place;

    LocalDateTime visitTime; // Thời gian gợi ý để tham quan
    LocalDateTime departureTime; // Thời gian rời đi
}