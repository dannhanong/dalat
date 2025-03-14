package com.dan.dalat.controllers;

import com.dan.dalat.dtos.responses.LocationResponse;
import com.dan.dalat.utils.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class LocationController {
    @Autowired
    private ClientService clientService;

    @GetMapping("/public/get-location")
    public ResponseEntity<LocationResponse> getLocation(@RequestParam String address) {
        return ResponseEntity.ok(clientService.getLocationByAddress(address));
    }

    @PostMapping("/location")
    public Map<String, Object> receiveLocation(@RequestBody Map<String, Double> location) {
        double latitude = location.get("latitude");
        double longitude = location.get("longitude");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vị trí nhận thành công!");
        response.put("latitude", latitude);
        response.put("longitude", longitude);

        return response;
    }
}
