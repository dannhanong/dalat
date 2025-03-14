package com.dan.dalat.services.impls;

import com.dan.dalat.dtos.requests.AddPlaceToItineraryRequest;
import com.dan.dalat.dtos.requests.ItemRequest;
import com.dan.dalat.dtos.requests.ItineraryDayRequest;
import com.dan.dalat.dtos.requests.ItineraryRequest;
import com.dan.dalat.dtos.responses.ItemResponse;
import com.dan.dalat.dtos.responses.ItineraryDayResponse;
import com.dan.dalat.dtos.responses.PlaceWithTimeInfo;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.dtos.responses.TravelDetalPlacePlanResponse;
import com.dan.dalat.models.Itinerary;
import com.dan.dalat.models.ItineraryDay;
import com.dan.dalat.models.ItineraryItem;
import com.dan.dalat.models.Place;
import com.dan.dalat.models.User;
import com.dan.dalat.repositories.ItineraryDayRepository;
import com.dan.dalat.repositories.ItineraryItemRepository;
import com.dan.dalat.repositories.ItineraryRepository;
import com.dan.dalat.repositories.PlaceRepository;
import com.dan.dalat.repositories.UserRepository;
import com.dan.dalat.services.ItineraryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class ItineraryServiceImpl implements ItineraryService {
    @Autowired
    private ItineraryRepository itineraryRepository;
    @Autowired
    private ItineraryDayRepository itineraryDayRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ItineraryItemRepository itineraryItemRepository;
    @Autowired
    private PlaceRepository placeRepository;

    // @Override
    // public List<ItineraryDayResponse> getDaysByItineraryId(Long itineraryId) {
    // List<ItineraryDay> days =
    // itineraryDayRepository.findByItinerary_IdOrderByDayNumberAsc(itineraryId);
    // return days.stream()
    // .map(this::mapToResponse)
    // .collect(Collectors.toList());
    // }

    // @Override
    // public ItineraryDayResponse getDayById(Long dayId) {
    // ItineraryDay day = itineraryDayRepository.findById(dayId)
    // .orElseThrow(() -> new RuntimeException("Day not found"));

    // return mapToResponse(day);
    // }

    // @Override
    // @Transactional
    // public ItineraryDayResponse updateDay(Long dayId, ItineraryDayRequest
    // request, Long userId) {
    // ItineraryDay day = itineraryDayRepository.findById(dayId)
    // .orElseThrow(() -> new RuntimeException("Day not found"));
    // // Kiểm tra quyền sở hữu
    // if (!day.getItinerary().getUser().getId().equals(userId)) {
    // throw new RuntimeException("You don't have permission to modify this day");
    // }

    // if (request.getDescription() != null) {
    // day.setDescription(request.getDescription());
    // }

    // ItineraryDay updatedDay = itineraryDayRepository.save(day);

    // // Cập nhật lại tổng chi phí
    // recalculateTotals(day.getItinerary().getId());

    // return mapToResponse(updatedDay);
    // }

    // @Override
    // @Transactional
    // public ResponseMessage swapDays(Long itineraryId, Integer day1Number, Integer
    // day2Number, Long userId) {
    // Itinerary itinerary = itineraryRepository.findById(itineraryId)
    // .orElseThrow(() -> new RuntimeException("Itinerary not found"));

    // // Kiểm tra quyền sở hữu
    // if (!itinerary.getUser().getId().equals(userId)) {
    // throw new RuntimeException("You don't have permission to modify this
    // itinerary");
    // }

    // // Tìm 2 ngày cần hoán đổi
    // ItineraryDay day1 =
    // itineraryDayRepository.findByItinerary_IdAndDayNumber(itineraryId,
    // day1Number)
    // .orElseThrow(() -> new RuntimeException("Không tìm thấy ngày " +
    // day1Number));

    // ItineraryDay day2 =
    // itineraryDayRepository.findByItinerary_IdAndDayNumber(itineraryId,
    // day2Number)
    // .orElseThrow(() -> new RuntimeException("Không tìm thấy ngày " +
    // day2Number));

    // // Hoán đổi số thứ tự ngày
    // day1.setDayNumber(day2Number);
    // day2.setDayNumber(day1Number);

    // itineraryDayRepository.save(day1);
    // itineraryDayRepository.save(day2);
    // }

    @Override
    public Page<Itinerary> getItineraries(String keyword, Pageable pageable, String username) {
        return itineraryRepository.findByUser_UsernameAndTitleContainingIgnoreCase(username, keyword, pageable);
    }

    @Override
    @Transactional
    public Itinerary createItinerary(ItineraryRequest request, String username) {
        // Xác thực người dùng
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("Không tìm thấy người dùng");
        }

        // Xác thực dữ liệu đầu vào
        validateItineraryRequest(request);

        // Tạo itinerary
        Itinerary itinerary = new Itinerary();
        itinerary.setTitle(request.getTitle());
        itinerary.setUser(user);
        itinerary.setStartDate(request.getStartDate());
        itinerary.setEndDate(request.getEndDate());
        itinerary.setTotalAdults(request.getTotalAdults());
        itinerary.setTotalChildren(request.getTotalChildren());
        itinerary.setTotalCost(0);
        itinerary.setTotalPlaces(0);

        // Lưu thông tin hành trình chính
        Itinerary savedItinerary = itineraryRepository.save(itinerary);

        List<ItineraryDay> savedDays = new ArrayList<>();

        // Tạo các ngày cho hành trình
        if (request.getDays() != null && !request.getDays().isEmpty()) {
            List<ItineraryDay> daysToSave = new ArrayList<>();
            Map<ItineraryDay, List<ItineraryItem>> itemsMap = new HashMap<>();

            for (ItineraryDayRequest dayReq : request.getDays()) {
                ItineraryDay day = new ItineraryDay();
                day.setItinerary(savedItinerary);
                day.setDate(dayReq.getDate());
                day.setDayNumber(dayReq.getDayNumber());

                daysToSave.add(day);

                // Chuẩn bị danh sách items cho ngày này
                if (dayReq.getItems() != null && !dayReq.getItems().isEmpty()) {
                    itemsMap.put(day, createItemsForDay(day, dayReq.getItems(), request.getTotalAdults(),
                            request.getTotalChildren()));
                }
            }

            // Lưu tất cả các ngày cùng lúc
            savedDays = itineraryDayRepository.saveAll(daysToSave);

            itineraryDayRepository.saveAll(savedDays);

            // Lưu tất cả các items
            List<ItineraryItem> allItems = new ArrayList<>();
            for (ItineraryDay day : savedDays) {
                List<ItineraryItem> dayItems = itemsMap.get(day);
                if (dayItems != null) {
                    allItems.addAll(dayItems);
                }
            }

            if (!allItems.isEmpty()) {
                itineraryItemRepository.saveAll(allItems);
            }
        }

        System.out.println("Total place: " + savedDays.stream().mapToInt(day -> day.getItems().size()).sum());

        // Tính lại tổng chi phí, tổng địa điểm
        int totalPlaces = itineraryItemRepository.countByDay_Itinerary_IdAndPlaceIsNotNull(savedItinerary.getId());
        savedItinerary.setTotalPlaces(totalPlaces);

        savedItinerary.setTotalCost(savedDays.stream()
                .mapToInt(day -> day.getDayCost() != null ? day.getDayCost() : 0)
                .sum());

        return itineraryRepository.save(savedItinerary);
    }

    private List<ItineraryItem> createItemsForDay(ItineraryDay day, List<ItemRequest> itemRequests, int numberAdults,
            int numberChildren) {
        List<ItineraryItem> items = new ArrayList<>();

        for (int i = 0; i < itemRequests.size(); i++) {
            ItemRequest itemReq = itemRequests.get(i);
            ItineraryItem item = new ItineraryItem();
            item.setDay(day);
            item.setVisitTime(itemReq.getVisitTime());
            item.setDepartureTime(itemReq.getDepartureTime());

            // Nếu có địa điểm
            if (itemReq.getPlaceId() != null) {
                try {
                    Place place = placeRepository.findById(itemReq.getPlaceId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Không tìm thấy địa điểm id=" + itemReq.getPlaceId()));
                    item.setPlace(place);

                } catch (Exception e) {
                    // Có thể quyết định bỏ qua hoặc ném ngoại lệ tùy vào yêu cầu
                    e.printStackTrace();
                }
            }

            items.add(item);
        }

        day.setDayCost(items.stream().mapToInt(
                item -> item.getPlace().getAdultFare() * numberAdults + item.getPlace().getChildFare() * numberChildren)
                .sum());
        System.out.println("Day cost: " + day.getDayCost());
        itineraryDayRepository.save(day);
        return items;
    }

    private void validateItineraryRequest(ItineraryRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề không được để trống");
        }

        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        if (request.getDays() != null) {
            Set<Integer> dayNumbers = new HashSet<>();
            for (ItineraryDayRequest day : request.getDays()) {
                if (day.getDayNumber() == null || day.getDayNumber() < 1) {
                    throw new IllegalArgumentException("Số thứ tự ngày không hợp lệ");
                }

                if (!dayNumbers.add(day.getDayNumber())) {
                    throw new IllegalArgumentException("Trùng lặp số thứ tự ngày: " + day.getDayNumber());
                }
            }
        }
    }

    @Override
    @Transactional
    public Itinerary updateItinerary(Long id, ItineraryRequest request, String username) {
        // Tìm itinerary hiện tại
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hành trình"));

        // Kiểm tra quyền sở hữu
        if (!itinerary.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You don't have permission to modify this itinerary");
        }

        // Xác thực dữ liệu đầu vào nếu cần
        // validateItineraryRequest(request);

        // --- Cập nhật thông tin cơ bản ---
        if (request.getTitle() != null) {
            itinerary.setTitle(request.getTitle());
        }

        // Cập nhật ngày bắt đầu/kết thúc nếu có
        boolean datesChanged = false;
        if (request.getStartDate() != null && !request.getStartDate().equals(itinerary.getStartDate())) {
            itinerary.setStartDate(request.getStartDate());
            datesChanged = true;
        }

        if (request.getEndDate() != null && !request.getEndDate().equals(itinerary.getEndDate())) {
            itinerary.setEndDate(request.getEndDate());
            datesChanged = true;
        }

        // Nếu cả startDate và endDate đều thay đổi, cần kiểm tra tính hợp lệ
        if (datesChanged && itinerary.getStartDate() != null && itinerary.getEndDate() != null
                && itinerary.getStartDate().isAfter(itinerary.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        // --- Xử lý cập nhật/thêm/xóa các ngày ---
        if (request.getDays() != null) {
            updateItineraryDays(itinerary, request.getDays());
        }

        // Tính lại tổng chi phí, tổng địa điểm, và tổng ngày
        // Lưu lại và trả về
        return itineraryRepository.save(itinerary);
    }

    /**
     * Xử lý cập nhật/thêm/xóa các ngày và items trong hành trình
     */
    private void updateItineraryDays(Itinerary itinerary, List<ItineraryDayRequest> dayRequests) {
        // Lấy danh sách ngày hiện tại, nhóm theo dayNumber để dễ tra cứu
        Map<Integer, ItineraryDay> existingDaysByNumber = itinerary.getDays().stream()
                .collect(Collectors.toMap(ItineraryDay::getDayNumber, day -> day));

        // Danh sách các dayNumber đã xử lý để biết ngày nào cần giữ lại
        Set<Integer> processedDayNumbers = new HashSet<>();

        // Xử lý từng dayRequest
        for (ItineraryDayRequest dayRequest : dayRequests) {
            Integer dayNumber = dayRequest.getDayNumber();
            processedDayNumbers.add(dayNumber);

            if (existingDaysByNumber.containsKey(dayNumber)) {
                // CẬP NHẬT ngày hiện có
                ItineraryDay existingDay = existingDaysByNumber.get(dayNumber);
                updateExistingDay(existingDay, dayRequest);
            } else {
                // THÊM ngày mới
                createNewDay(itinerary, dayRequest);
            }
        }

        // XÓA các ngày không có trong request
        List<ItineraryDay> daysToRemove = itinerary.getDays().stream()
                .filter(day -> !processedDayNumbers.contains(day.getDayNumber()))
                .collect(Collectors.toList());

        for (ItineraryDay dayToRemove : daysToRemove) {
            itineraryDayRepository.delete(dayToRemove);
            itinerary.getDays().remove(dayToRemove);
        }
    }

    /**
     * Cập nhật thông tin ngày hiện có
     */
    private void updateExistingDay(ItineraryDay existingDay, ItineraryDayRequest dayRequest) {
        if (dayRequest.getDate() != null) {
            existingDay.setDate(dayRequest.getDate());
        }

        // Lưu lại ngày trước khi xử lý items (để đảm bảo quan hệ)
        itineraryDayRepository.save(existingDay);

        // Xử lý các items nếu có
        if (dayRequest.getItems() != null) {
            updateDayItems(existingDay, dayRequest.getItems());
        }
    }

    /**
     * Tạo ngày mới trong hành trình
     */
    private ItineraryDay createNewDay(Itinerary itinerary, ItineraryDayRequest dayRequest) {
        ItineraryDay newDay = new ItineraryDay();
        newDay.setItinerary(itinerary);
        newDay.setDayNumber(dayRequest.getDayNumber());
        newDay.setDate(dayRequest.getDate());
        newDay.setDayCost(0); // Sẽ được tính lại sau

        // Lưu ngày mới vào DB
        ItineraryDay savedDay = itineraryDayRepository.save(newDay);

        // Thêm vào danh sách ngày của itinerary
        itinerary.getDays().add(savedDay);

        // Xử lý các items nếu có
        if (dayRequest.getItems() != null && !dayRequest.getItems().isEmpty()) {
            List<ItineraryItem> items = createItemsForDay(savedDay, dayRequest.getItems(), itinerary.getTotalAdults(),
                    itinerary.getTotalChildren());
            itineraryItemRepository.saveAll(items);
        }

        return savedDay;
    }

    /**
     * Cập nhật/thêm/xóa các items trong một ngày
     */
    private void updateDayItems(ItineraryDay day, List<ItemRequest> itemRequests) {
        // Lấy danh sách items hiện tại, nhóm theo ID để dễ tra cứu
        Map<Long, ItineraryItem> existingItemsById = new HashMap<>();
        if (day.getItems() != null) {
            existingItemsById = day.getItems().stream()
                    .collect(Collectors.toMap(ItineraryItem::getId, item -> item));
        }

        // Danh sách các item ID đã xử lý
        Set<Long> processedItemIds = new HashSet<>();
        List<ItineraryItem> itemsToSave = new ArrayList<>();

        // Xử lý từng itemRequest
        for (ItemRequest itemRequest : itemRequests) {
            if (itemRequest.getId() != null && existingItemsById.containsKey(itemRequest.getId())) {
                // CẬP NHẬT item hiện có
                Long itemId = itemRequest.getId();
                processedItemIds.add(itemId);

                ItineraryItem existingItem = existingItemsById.get(itemId);
                updateExistingItem(existingItem, itemRequest);
                itemsToSave.add(existingItem);
            } else {
                // THÊM item mới
                ItineraryItem newItem = createNewItem(day, itemRequest);
                itemsToSave.add(newItem);
            }
        }

        // Lưu tất cả items đã cập nhật và thêm mới
        if (!itemsToSave.isEmpty()) {
            itineraryItemRepository.saveAll(itemsToSave);
        }

        // XÓA các items không có trong request
        if (day.getItems() != null) {
            List<ItineraryItem> itemsToRemove = day.getItems().stream()
                    .filter(item -> item.getId() != null && !processedItemIds.contains(item.getId()))
                    .collect(Collectors.toList());

            if (!itemsToRemove.isEmpty()) {
                itineraryItemRepository.deleteAll(itemsToRemove);
                day.getItems().removeAll(itemsToRemove);
            }
        }

        // Tính lại chi phí cho ngày
        itineraryDayRepository.save(day);
    }

    /**
     * Cập nhật thông tin của một item hiện có
     */
    private void updateExistingItem(ItineraryItem existingItem, ItemRequest request) {
        // Cập nhật thời gian thăm quan
        if (request.getVisitTime() != null) {
            existingItem.setVisitTime(request.getVisitTime());
        }

        // Cập nhật thời gian rời đi
        if (request.getDepartureTime() != null) {
            existingItem.setDepartureTime(request.getDepartureTime());
        }

        // Cập nhật địa điểm nếu có thay đổi
        if (request.getPlaceId() != null) {
            boolean isPlaceChanged = existingItem.getPlace() == null ||
                    !request.getPlaceId().equals(existingItem.getPlace().getId());

            if (isPlaceChanged) {
                Place newPlace = placeRepository.findById(request.getPlaceId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm id=" + request.getPlaceId()));
                existingItem.setPlace(newPlace);
            }
        }
    }

    /**
     * Tạo item mới cho một ngày
     */
    private ItineraryItem createNewItem(ItineraryDay day, ItemRequest request) {
        ItineraryItem newItem = new ItineraryItem();
        newItem.setDay(day);
        newItem.setVisitTime(request.getVisitTime());
        newItem.setDepartureTime(request.getDepartureTime());

        // Thêm địa điểm nếu có
        if (request.getPlaceId() != null) {
            Place place = placeRepository.findById(request.getPlaceId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm id=" + request.getPlaceId()));
            newItem.setPlace(place);
        }

        return newItem;
    }

    @Override
    @Transactional
    public ResponseMessage deleteItinerary(Long id, String username) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hành trình"));

        // // Kiểm tra quyền sở hữu
        if (!itinerary.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You don't have permission to delete this itinerary");
        }

        itineraryRepository.delete(itinerary);

        return new ResponseMessage(200, "Xóa hành trình thành công");
    }

    @Override
    @Transactional
    public List<TravelDetalPlacePlanResponse> getTravelPlan(Long id) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hành trình"));

        List<ItineraryDay> days = itinerary.getDays();

        List<TravelDetalPlacePlanResponse> responses = new ArrayList<>();

        for (int i = 0; i < days.size(); i++) {
            ItineraryDay day = days.get(i);
            TravelDetalPlacePlanResponse response = new TravelDetalPlacePlanResponse();
            response.setDay(day.getDayNumber());
            response.setDayId(day.getId());
            response.setDate(day.getDate().toString());
            response.setDailyCost(day.getDayCost() == null ? 0 : day.getDayCost());

            List<ItineraryItem> items = day.getItems();
            // List<Place> places = items.stream()
            //         .map(item -> item.getPlace())
            //         .collect(Collectors.toList());

            List<PlaceWithTimeInfo> placesWithTime = new ArrayList<>();
            for (ItineraryItem item : items) {
                PlaceWithTimeInfo placeWithTime = new PlaceWithTimeInfo(item.getPlace());
                placeWithTime.setItemId(item.getId());
                placeWithTime.setArrivalTime(item.getVisitTime().toString().substring(12));
                placeWithTime.setDepartureTime(item.getDepartureTime().toString().substring(12));
                placeWithTime.setId(item.getPlace().getId());
                placeWithTime.setName(item.getPlace().getName());
                placeWithTime.setDescription(item.getPlace().getDescription());
                placeWithTime.setLatitude(item.getPlace().getLatitude());
                placeWithTime.setLongitude(item.getPlace().getLongitude());
                placeWithTime.setAdultFare(item.getPlace().getAdultFare());
                placeWithTime.setChildFare(item.getPlace().getChildFare());
                placeWithTime.setImageCode(item.getPlace().getImageCode());
                placeWithTime.setOtherImages(item.getPlace().getOtherImages());
                placeWithTime.setCategory(item.getPlace().getCategory());
                placeWithTime.setHobbies(item.getPlace().getHobbies());
                placeWithTime.setServices(item.getPlace().getServices());
                placesWithTime.add(placeWithTime);
            }

            response.setPlaces(placesWithTime);

            responses.add(response);
        }

        return responses;
    }

    @Override
    public ResponseMessage addPlaceToItinerary(Long dayId, AddPlaceToItineraryRequest addPlaceToItineraryRequest, String username) {
        ItineraryDay day = itineraryDayRepository.findById(dayId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngày trong hành trình"));

        Itinerary itinerary = day.getItinerary();

        // Kiểm tra quyền sở hữu
        if (!itinerary.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You don't have permission to modify this itinerary");
        }

        Place place = placeRepository.findById(addPlaceToItineraryRequest.getPlaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));

        ItineraryItem item = new ItineraryItem();
        item.setDay(day);
        item.setPlace(place);
        item.setVisitTime(addPlaceToItineraryRequest.getVisitTime());
        item.setDepartureTime(addPlaceToItineraryRequest.getLeaveTime());

        itineraryItemRepository.save(item);

        day.setDayCost(day.getDayCost() + place.getAdultFare() * itinerary.getTotalAdults()
                + place.getChildFare() * itinerary.getTotalChildren());
        itineraryDayRepository.save(day);

        itinerary.setTotalPlaces(itinerary.getTotalPlaces() + 1);
        itinerary.setTotalCost(itinerary.getTotalCost() + place.getAdultFare() * itinerary.getTotalAdults()
                + place.getChildFare() * itinerary.getTotalChildren());
        itineraryRepository.save(itinerary);

        return new ResponseMessage(200, "Thêm địa điểm vào hành trình thành công");
    }

    @Override
    @Transactional
    public ResponseMessage removePlaceFromItinerary(Long itemId) {
        ItineraryDay day = itineraryItemRepository.findById(itemId).map(ItineraryItem::getDay)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm trong hành trình"));

        Itinerary itinerary = day.getItinerary();

        int currentDayNumber = day.getDayNumber();

        return itineraryItemRepository.findById(itemId).map(item -> {
            boolean lastItem = day.getItems().size() == 1;
            itineraryItemRepository.deleteItemById(itemId);
            if (lastItem) {
                List<ItineraryDay> days = itineraryDayRepository
                        .findByItinerary_IdAndDayNumberGreaterThan(day.getItinerary().getId(), currentDayNumber);
                for (ItineraryDay d : days) {
                    d.setDayNumber(d.getDayNumber() - 1);
                    itineraryDayRepository.save(d);
                }
                itineraryDayRepository.delete(day);
            } else {
                day.setDayCost(day.getDayCost() - item.getPlace().getAdultFare() * itinerary.getTotalAdults()
                        - item.getPlace().getChildFare() * itinerary.getTotalChildren());
                itineraryDayRepository.save(day);
            }

            itinerary.setTotalPlaces(itinerary.getTotalPlaces() - 1);
            itinerary
                    .setTotalCost(itinerary.getTotalCost() - item.getPlace().getAdultFare() * itinerary.getTotalAdults()
                            - item.getPlace().getChildFare() * itinerary.getTotalChildren());
            itineraryRepository.save(itinerary);

            return new ResponseMessage(200, "Xóa địa điểm khỏi hành trình thành công");
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm trong hành trình"));
    }

    @Override
    @Transactional
    public ResponseMessage removeDayFromItinerary(Long dayId) {
        // Tìm ngày và lấy thông tin liên quan
        ItineraryDay day = itineraryDayRepository.findById(dayId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngày trong hành trình"));

        Itinerary itinerary = day.getItinerary();
        int currentDayNumber = day.getDayNumber();

        // Kiểm tra xem có phải ngày cuối cùng không
        boolean isLastDay = itineraryDayRepository.countByItinerary_Id(itinerary.getId()) == 1;

        // Thu thập dữ liệu trước khi xóa
        int itemCount = day.getItems().size();
        int dayCost = day.getDayCost() != null ? day.getDayCost() : 0;

        // 1. Xóa tất cả items của ngày này
        itineraryItemRepository.deleteAll(day.getItems());

        // 2. Xóa ngày
        itineraryDayRepository.delete(day);

        // Nếu là ngày cuối cùng, xóa luôn hành trình
        if (isLastDay) {
            itineraryRepository.delete(itinerary);
            return new ResponseMessage(200, "Đã xóa ngày cuối cùng và hành trình");
        }

        // Nếu không phải ngày cuối, tiếp tục xử lý bình thường
        // 3. Cập nhật số thứ tự các ngày sau
        List<ItineraryDay> subsequentDays = itineraryDayRepository
                .findByItinerary_IdAndDayNumberGreaterThan(itinerary.getId(), currentDayNumber);
        for (ItineraryDay d : subsequentDays) {
            d.setDayNumber(d.getDayNumber() - 1);
            itineraryDayRepository.save(d);
        }

        // 4. Cập nhật thông tin hành trình
        itinerary.setTotalDays(itinerary.getTotalDays() - 1);
        itinerary.setTotalCost(itinerary.getTotalCost() - dayCost);
        itinerary.setTotalPlaces(itinerary.getTotalPlaces() - itemCount);
        itineraryRepository.save(itinerary);

        return new ResponseMessage(200, "Xóa ngày khỏi hành trình thành công");
    }

    // @Override
    // @Transactional
    // public Itinerary recalculateTotals(Long itineraryId) {
    // Itinerary itinerary = itineraryRepository.findById(itineraryId)
    // .orElseThrow(() -> new RuntimeException("Không tìm thấy hành trình"));

    // // Lấy tất cả các ngày
    // List<ItineraryDay> days =
    // itineraryDayRepository.findByItinerary_IdOrderByDayNumberAsc(itineraryId);

    // // Tính tổng chi phí từ tất cả các ngày
    // int totalCost = 0;
    // int totalPlaces = 0;

    // for (ItineraryDay day : days) {
    // // Tính lại chi phí cho từng ngày
    // day.recalculateDayCost();
    // totalCost += day.getDayCost();
    // totalPlaces += day.getItems().size();

    // // Lưu lại chi phí đã tính
    // itineraryDayRepository.save(day);
    // }

    // // Cập nhật lại tổng chi phí cho itinerary
    // itinerary.setTotalCost(totalCost);
    // itinerary.setTotalPlaces(totalPlaces);

    // return itineraryRepository.save(itinerary);
    // }

    // // Phương thức cập nhật số ngày
    // private void updateTotalDays(Itinerary itinerary, Integer newTotalDays) {
    // Integer currentDays = itinerary.getTotalDays();

    // // Nếu tăng số ngày
    // if (newTotalDays > currentDays) {
    // // Tạo thêm các ngày mới
    // for (int i = currentDays + 1; i <= newTotalDays; i++) {
    // ItineraryDay day = new ItineraryDay();
    // day.setItinerary(itinerary);
    // day.setDayNumber(i);
    // day.setDescription("Ngày " + i);
    // day.setDayCost(0);
    // itineraryDayRepository.save(day);
    // }
    // }
    // // Nếu giảm số ngày
    // else if (newTotalDays < currentDays) {
    // // Xóa các ngày thừa, bắt đầu từ ngày cuối cùng
    // for (int i = currentDays; i > newTotalDays; i--) {
    // itineraryDayRepository.deleteByItinerary_IdAndDayNumber(itinerary.getId(),
    // i);
    // }
    // }

    // // Cập nhật lại tổng số ngày
    // itinerary.setTotalDays(newTotalDays);
    // }

    // // Phương thức helper để chuyển đổi từ Entity sang DTO
    // private ItineraryDayResponse mapToResponse(ItineraryDay day) {
    // ItineraryDayResponse response = new ItineraryDayResponse();
    // response.setId(day.getId());
    // response.setDayNumber(day.getDayNumber());
    // response.setDescription(day.getDescription());
    // response.setDayCost(day.getDayCost());
    // response.setItineraryId(day.getItinerary().getId());

    // // Map các items trong ngày
    // List<ItemResponse> items = day.getItems().stream()
    // .map(this::mapItemToResponse)
    // .collect(Collectors.toList());

    // response.setItems(items);

    // return response;
    // }

    // private ItemResponse mapItemToResponse(ItineraryItem item) {
    // ItemResponse response = new ItemResponse();
    // response.setId(item.getId());
    // response.setVisitTime(item.getVisitTime());
    // response.setDurationMinutes(item.getDurationMinutes());

    // if (item.getPlace() != null) {
    // response.setPlaceId(item.getPlace().getId());
    // response.setPlaceName(item.getPlace().getName());
    // response.setPlaceAddress(item.getPlace().getAddress());
    // response.setAdultFare(item.getPlace().getAdultFare());
    // response.setImageUrl(item.getPlace().getImageCode());
    // }

    // return response;
    // }
}