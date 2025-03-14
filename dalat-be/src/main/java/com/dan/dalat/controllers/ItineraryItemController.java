package com.dan.dalat.controllers;

import com.dan.dalat.models.ItineraryItem;
import com.dan.dalat.services.ItineraryItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/itinerary-items")
public class ItineraryItemController {

    // @Autowired
    // private ItineraryItemService itineraryItemService;

    // @GetMapping("/{id}")
    // public ResponseEntity<ItineraryItem> getItemById(@PathVariable Long id) {
    //     Optional<ItineraryItem> item = itineraryItemService.getItineraryItemById(id);
    //     return item.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    // }

    // @PostMapping
    // public ItineraryItem createItem(@RequestBody ItineraryItem item) {
    //     return itineraryItemService.createItineraryItem(item);
    // }

    // @PutMapping("/{id}")
    // public ResponseEntity<ItineraryItem> updateItem(@PathVariable Long id, @RequestBody ItineraryItem updatedItem) {
    //     try {
    //         return ResponseEntity.ok(itineraryItemService.updateItineraryItem(id, updatedItem));
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.notFound().build();
    //     }
    // }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
    //     itineraryItemService.deleteItineraryItem(id);
    //     return ResponseEntity.noContent().build();
    // }
}