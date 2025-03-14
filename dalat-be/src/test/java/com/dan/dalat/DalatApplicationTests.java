package com.dan.dalat;

import com.dan.dalat.dtos.responses.LocationResponse;
import com.dan.dalat.utils.ClientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DalatApplicationTests {
	@Autowired
	private ClientService clientService;

	@Test
	void contextLoads() {
		LocationResponse locationResponse = clientService.getLocationByAddress("đồi chè cầu đất");
		System.out.println(locationResponse.getLat());
		System.out.println(locationResponse.getLon());
	}

}
