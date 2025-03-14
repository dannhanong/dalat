package com.dan.dalat.dtos.responses;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
public class LocationResponse {
    @JsonProperty("place_id")
    private Long placeId;

    @JsonProperty("licence")
    private String licence;

    @JsonProperty("osm_type")
    private String osmType;

    @JsonProperty("osm_id")
    private Long osmId;

    @JsonProperty("lat")
    private String lat;

    @JsonProperty("lon")
    private String lon;

    @JsonProperty("class")
    private String classification;

    @JsonProperty("type")
    private String type;

    @JsonProperty("place_rank")
    private Integer placeRank;

    @JsonProperty("importance")
    private Double importance;

    @JsonProperty("addresstype")
    private String addressType;

    @JsonProperty("name")
    private String name;

    @JsonProperty("display_name")
    private String displayName;

    @JsonProperty("boundingbox")
    private List<String> boundingBox;
}