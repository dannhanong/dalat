package com.dan.dalat.services.impls;

import com.dan.dalat.dtos.requests.ItemRequest;
import com.dan.dalat.dtos.responses.ItemResponse;
import com.dan.dalat.models.ItineraryDay;
import com.dan.dalat.models.ItineraryItem;
import com.dan.dalat.models.Place;
import com.dan.dalat.repositories.ItineraryDayRepository;
import com.dan.dalat.repositories.ItineraryItemRepository;
import com.dan.dalat.repositories.PlaceRepository;
import com.dan.dalat.services.ItineraryItemService;
import com.dan.dalat.services.ItineraryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ItineraryItemServiceImpl implements ItineraryItemService {
    @Autowired
    private ItineraryItemRepository itineraryItemRepository;

    @Autowired
    private ItineraryDayRepository itineraryDayRepository;

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private ItineraryService itineraryService;

    // @Override
    // public ItemResponse addItemToDay(Long dayId, ItemRequest request, Long userId) {
    //     ItineraryDay day = itineraryDayRepository.findById(dayId)
    //             .orElseThrow(() -> new ResourceNotFoundException("ItineraryDay", "id", dayId));
        
    //     // Kiểm tra quyền sở hữu
    //     if (!day.getItinerary().getUser().getId().equals(userId)) {
    //         throw new UnauthorizedException("You don't have permission to modify this day");
    //     }
        
    //     Place place = placeRepository.findById(request.getPlaceId())
    //             .orElseThrow(() -> new ResourceNotFoundException("Place", "id", request.getPlaceId()));
        
    //     // Tạo mới item
    //     ItineraryItem item = new ItineraryItem();
    //     item.setDay(day);
    //     item.setPlace(place);
    //     item.setVisitTime(request.getVisitTime() != null ? request.getVisitTime() : LocalDateTime.now());
    //     item.setDurationMinutes(request.getDurationMinutes());
    //     item.setTransportMode(request.getTransportMode());
    //     item.setNotes(request.getNotes());
        
    //     // Tính toán thứ tự và khoảng cách
    //     int visitOrder = day.getItems().size() + 1;
    //     item.setVisitOrder(visitOrder);
        
    //     // Nếu không phải là địa điểm đầu tiên, tính khoảng cách và thời gian di chuyển
    //     if (visitOrder > 1) {
    //         // Lấy địa điểm trước đó
    //         Optional<ItineraryItem> previousItem = day.getItems().stream()
    //             .filter(i -> i.getVisitOrder() == visitOrder - 1)
    //             .findFirst();
                
    //         if (previousItem.isPresent() && previousItem.get().getPlace() != null) {
    //             // Tính khoảng cách (demo - trong thực tế có thể sử dụng Google Maps API)
    //             double distance = calculateDistance(
    //                 previousItem.get().getPlace().getLatitude(),
    //                 previousItem.get().getPlace().getLongitude(),
    //                 place.getLatitude(),
    //                 place.getLongitude()
    //             );
                
    //             item.setDistanceFromPrevious(distance);
                
    //             // Ước tính thời gian di chuyển (giả định 3 phút/km nếu đi ô tô)
    //             int travelTime = (int) (distance * 3);
    //             item.setTravelTimeFromPrevious(travelTime);
    //         }
    //     }
        
    //     ItineraryItem savedItem = itineraryItemRepository.save(item);
        
    //     // Cập nhật lại chi phí
    //     day.recalculateDayCost();
    //     itineraryDayRepository.save(day);
        
    //     // Cập nhật tổng hợp cho hành trình
    //     itineraryService.recalculateTotals(day.getItinerary().getId());
        
    //     return mapToResponse(savedItem);
    // }
    
    // @Override
    // public ItemResponse updateItem(Long itemId, ItemRequest request, Long userId) {
    //     ItineraryItem item = itineraryItemRepository.findById(itemId)
    //             .orElseThrow(() -> new ResourceNotFoundException("ItineraryItem", "id", itemId));
        
    //     // Kiểm tra quyền sở hữu
    //     if (!item.getDay().getItinerary().getUser().getId().equals(userId)) {
    //         throw new UnauthorizedException("You don't have permission to update this item");
    //     }
        
    //     // Nếu có thay đổi địa điểm
    //     if (request.getPlaceId() != null && !request.getPlaceId().equals(item.getPlace().getId())) {
    //         Place place = placeRepository.findById(request.getPlaceId())
    //                 .orElseThrow(() -> new ResourceNotFoundException("Place", "id", request.getPlaceId()));
    //         item.setPlace(place);
            
    //         // Tính lại khoảng cách từ điểm trước đó nếu có
    //         recalculateDistanceAndTime(item);
    //     }
        
    //     // Cập nhật thông tin khác
    //     if (request.getVisitTime() != null) {
    //         item.setVisitTime(request.getVisitTime());
    //     }
        
    //     if (request.getDurationMinutes() != null) {
    //         item.setDurationMinutes(request.getDurationMinutes());
    //     }
        
    //     if (request.getTransportMode() != null) {
    //         item.setTransportMode(request.getTransportMode());
    //     }
        
    //     if (request.getNotes() != null) {
    //         item.setNotes(request.getNotes());
    //     }
        
    //     ItineraryItem updatedItem = itineraryItemRepository.save(item);
        
    //     // Cập nhật lại chi phí cho ngày
    //     ItineraryDay day = item.getDay();
    //     day.recalculateDayCost();
    //     itineraryDayRepository.save(day);
        
    //     // Cập nhật tổng chi phí cho hành trình
    //     itineraryService.recalculateTotals(day.getItinerary().getId());
        
    //     return mapToResponse(updatedItem);
    // }
    
    // @Override
    // public void removeItem(Long itemId, Long userId) {
    //     ItineraryItem item = itineraryItemRepository.findById(itemId)
    //             .orElseThrow(() -> new ResourceNotFoundException("ItineraryItem", "id", itemId));
        
    //     // Kiểm tra quyền sở hữu
    //     if (!item.getDay().getItinerary().getUser().getId().equals(userId)) {
    //         throw new UnauthorizedException("You don't have permission to delete this item");
    //     }
        
    //     ItineraryDay day = item.getDay();
    //     itineraryItemRepository.delete(item);
        
    //     // Cập nhật thứ tự các item còn lại
    //     List<ItineraryItem> remainingItems = itineraryItemRepository.findByDay_IdOrderByVisitOrderAsc(day.getId());
    //     for (int i = 0; i < remainingItems.size(); i++) {
    //         ItineraryItem currentItem = remainingItems.get(i);
    //         currentItem.setVisitOrder(i + 1);
    //         itineraryItemRepository.save(currentItem);
            
    //         // Cập nhật lại khoảng cách và thời gian nếu không phải item đầu tiên
    //         if (i > 0) {
    //             ItineraryItem prevItem = remainingItems.get(i - 1);
    //             updateDistanceAndTime(prevItem, currentItem);
    //         } else {
    //             // Reset khoảng cách và thời gian cho item đầu tiên
    //             currentItem.setDistanceFromPrevious(0.0);
    //             currentItem.setTravelTimeFromPrevious(0);
    //             itineraryItemRepository.save(currentItem);
    //         }
    //     }
        
    //     // Cập nhật lại chi phí
    //     day.recalculateDayCost();
    //     itineraryDayRepository.save(day);
        
    //     // Cập nhật tổng chi phí cho hành trình
    //     itineraryService.recalculateTotals(day.getItinerary().getId());
    // }
    
    // @Override
    // public List<ItemResponse> getItemsByDayId(Long dayId) {
    //     List<ItineraryItem> items = itineraryItemRepository.findByDay_IdOrderByVisitOrderAsc(dayId);
    //     return items.stream()
    //             .map(this::mapToResponse)
    //             .collect(Collectors.toList());
    // }
    
    // @Override
    // public void reorderItems(Long dayId, List<Long> itemIds, Long userId) {
    //     ItineraryDay day = itineraryDayRepository.findById(dayId)
    //             .orElseThrow(() -> new ResourceNotFoundException("ItineraryDay", "id", dayId));
        
    //     // Kiểm tra quyền sở hữu
    //     if (!day.getItinerary().getUser().getId().equals(userId)) {
    //         throw new UnauthorizedException("You don't have permission to modify this day");
    //     }
        
    //     // Kiểm tra xem số lượng itemIds có khớp với số items trong ngày
    //     if (itemIds.size() != day.getItems().size()) {
    //         throw new IllegalArgumentException("Number of items in request doesn't match number of items in day");
    //     }
        
    //     // Cập nhật thứ tự
    //     for (int i = 0; i < itemIds.size(); i++) {
    //         Long itemId = itemIds.get(i);
    //         ItineraryItem item = itineraryItemRepository.findById(itemId)
    //                 .orElseThrow(() -> new ResourceNotFoundException("ItineraryItem", "id", itemId));
            
    //         // Kiểm tra xem item này có thuộc ngày này không
    //         if (!item.getDay().getId().equals(dayId)) {
    //             throw new IllegalArgumentException("Item " + itemId + " doesn't belong to this day");
    //         }
            
    //         // Cập nhật thứ tự
    //         item.setVisitOrder(i + 1);
    //         itineraryItemRepository.save(item);
    //     }
        
    //     // Sau khi cập nhật thứ tự, cần tính lại khoảng cách và thời gian di chuyển
    //     List<ItineraryItem> sortedItems = itineraryItemRepository.findByDay_IdOrderByVisitOrderAsc(dayId);
    //     for (int i = 1; i < sortedItems.size(); i++) {
    //         ItineraryItem prevItem = sortedItems.get(i - 1);
    //         ItineraryItem currentItem = sortedItems.get(i);
            
    //         updateDistanceAndTime(prevItem, currentItem);
    //     }
    // }
    
    // // Phương thức helper để chuyển đổi từ Entity sang DTO
    // private ItemResponse mapToResponse(ItineraryItem item) {
    //     ItemResponse response = new ItemResponse();
    //     response.setId(item.getId());
    //     response.setVisitTime(item.getVisitTime());
    //     response.setDurationMinutes(item.getDurationMinutes());
    //     response.setDistanceFromPrevious(item.getDistanceFromPrevious());
    //     response.setTravelTimeFromPrevious(item.getTravelTimeFromPrevious());
    //     response.setTransportMode(item.getTransportMode());
    //     response.setNotes(item.getNotes());
        
    //     if (item.getPlace() != null) {
    //         response.setPlaceId(item.getPlace().getId());
    //         response.setPlaceName(item.getPlace().getName());
    //         response.setPlaceAddress(item.getPlace().getAddress());
    //         response.setAdultFare(item.getPlace().getAdultFare());
    //         response.setImageUrl(item.getPlace().getImageCode());
    //     }
        
    //     return response;
    // }
}
