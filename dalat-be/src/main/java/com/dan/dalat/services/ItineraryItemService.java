package com.dan.dalat.services;

import com.dan.dalat.dtos.requests.ItemRequest;
import com.dan.dalat.dtos.responses.ItemResponse;

import java.util.List;

public interface ItineraryItemService {
    // Thêm địa điểm vào một ngày
    // ItemResponse addItemToDay(Long dayId, ItemRequest request, Long userId);
    
    // Cập nhật thông tin của một địa điểm
    // ItemResponse updateItem(Long itemId, ItemRequest request, Long userId);
    
    // Xóa một địa điểm khỏi hành trình
    // void removeItem(Long itemId, Long userId);
    
    // Lấy danh sách các địa điểm trong một ngày
    // List<ItemResponse> getItemsByDayId(Long dayId);
    
    // Sắp xếp thứ tự các địa điểm trong một ngày
    // void reorderItems(Long dayId, List<Long> itemIds, Long userId);
}
