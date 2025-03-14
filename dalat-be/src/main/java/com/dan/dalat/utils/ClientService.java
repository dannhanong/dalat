package com.dan.dalat.utils;

import com.dan.dalat.dtos.responses.LocationResponse;
import com.dan.dalat.http_clients.OpenstreetmapClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClientService {
    @Autowired
    private OpenstreetmapClient openstreetmapClient;

    public LocationResponse getLocationByAddress(String address) {
        return openstreetmapClient.getLocationByAddress(address, "json", "2")[0];
    }
}
