package com.dan.dalat.http_clients;

import com.dan.dalat.dtos.responses.LocationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "openstreetmap", url = "https://nominatim.openstreetmap.org")
public interface OpenstreetmapClient {
    @GetMapping(value = "/search")
    LocationResponse[] getLocationByAddress(@RequestParam("q") String q,
                                          @RequestParam("format") String format,
                                          @RequestParam("limit") String limit);
}
