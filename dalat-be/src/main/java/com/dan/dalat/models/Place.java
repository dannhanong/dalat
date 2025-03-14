package com.dan.dalat.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "places")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    Category category;

    String address;
    BigDecimal latitude;
    BigDecimal longitude;
    Double rating;

    @Column(columnDefinition = "TEXT")
    String description;

    String imageCode;
    List<String> otherImages;

    @Column(name = "`show`")
    boolean show;

    Integer childFare;
    Integer adultFare;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id")
    User creator;

    LocalTime openTime;
    LocalTime closeTime;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "place_hobby",
            joinColumns = @JoinColumn(name = "place_id"),
            inverseJoinColumns = @JoinColumn(name = "hobby_id")
    )
    Set<Hobby> hobbies = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "place_service",
            joinColumns = @JoinColumn(name = "place_id"),
            inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    Set<TourismService> services = new HashSet<>();
}
