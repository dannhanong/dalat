package com.dan.dalat.services.impls;

import com.dan.dalat.dtos.requests.TourismServiceRequest;
import com.dan.dalat.dtos.requests.TravelPlanRequest;
import com.dan.dalat.dtos.responses.PlaceWithTimeInfo;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.dtos.responses.TravelDetalPlacePlanResponse;
import com.dan.dalat.dtos.responses.TravelPlanResponse;
import com.dan.dalat.http_clients.FilterClient;
import com.dan.dalat.models.Category;
import com.dan.dalat.models.Place;
import com.dan.dalat.models.TourismService;
import com.dan.dalat.repositories.CategoryRepository;
import com.dan.dalat.repositories.PlaceRepository;
import com.dan.dalat.repositories.TourismServiceRepository;
import com.dan.dalat.repositories.UserRepository;
import com.dan.dalat.services.TourismServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TourismServiceServiceImpl implements TourismServiceService {
    @Autowired
    private TourismServiceRepository tourismServiceRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private FilterClient filterClient;
    @Autowired
    private PlaceRepository placeRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public List<TourismService> getAll() {
        return tourismServiceRepository.findAll();
    }

    @Override
    public TourismService create(TourismServiceRequest tourismServiceRequest) {
        Category category = categoryRepository.findById(tourismServiceRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        TourismService tourismService = new TourismService();
        tourismService.setName(tourismServiceRequest.getName());
        tourismService.setCategory(category);
        return tourismServiceRepository.save(tourismService);
    }

    @Override
    public TourismService update(TourismServiceRequest tourismServiceRequest, Long id) {
        Category category = categoryRepository.findById(tourismServiceRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        return tourismServiceRepository.findById(id).map(t -> {
            t.setName(tourismServiceRequest.getName());
            t.setCategory(category);
            return tourismServiceRepository.save(t);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ du lịch"));
    }

    @Transactional
    @Override
    public ResponseMessage delete(Long id) {
        return tourismServiceRepository.findById(id).map(t -> {
            placeRepository.deleteAllPlaceServiceByServiceId(id);
            
            // Sau đó xóa TourismService
            tourismServiceRepository.delete(t);
            return new ResponseMessage(200, "Xóa dịch vụ du lịch thành công");
        }).orElseGet(() -> new ResponseMessage(404, "Không tìm thấy dịch vụ du lịch"));
    }

    @Override
    public TourismService getById(Long id) {
        return tourismServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ du lịch"));
    }

    @Override
    public List<TourismService> getServicesByCategory(Long categoryId) {
        return tourismServiceRepository.findByCategory_Id(categoryId);
    }

    @Override
    public List<TravelDetalPlacePlanResponse> getTravelPlan(TravelPlanRequest travelPlanRequest, String username) {
        Long userId = userRepository.findByUsername(username).getId();
        travelPlanRequest.setUserId(userId);
        List<TravelPlanResponse> travelPlanResponses = filterClient.getTravelPlan(travelPlanRequest);

        return travelPlanResponses.stream().map(
                travelPlanResponse -> {
                    TravelDetalPlacePlanResponse travelDetalPlacePlanResponse = new TravelDetalPlacePlanResponse();

                    // Map từ PlaceDetail sang PlaceWithTimeInfo
                    List<PlaceWithTimeInfo> placesWithTime = travelPlanResponse.getPlaces().stream().map(
                            placeDetail -> {
                                // Tìm Place từ database
                                Place place = placeRepository.findById(placeDetail.getId())
                                        .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));

                                // Tạo PlaceWithTimeInfo từ Place và thêm thông tin thời gian
                                PlaceWithTimeInfo placeWithTime = new PlaceWithTimeInfo(place);
                                placeWithTime.setArrivalTime(placeDetail.getArrivalTime());
                                placeWithTime.setDepartureTime(placeDetail.getDepartureTime());
                                placeWithTime.setVisitDurationMinutes(placeDetail.getVisitDurationMinutes());
                                placeWithTime.setTravelTimeMinutes(placeDetail.getTravelTimeMinutes());
                                placeWithTime.setTotalCost(placeDetail.getTotalCost());

                                return placeWithTime;
                            }).toList();

                    travelDetalPlacePlanResponse.setPlaces(placesWithTime);
                    travelDetalPlacePlanResponse.setDate(travelPlanResponse.getDate());
                    travelDetalPlacePlanResponse.setDay(travelPlanResponse.getDay());
                    travelDetalPlacePlanResponse.setDailyCost(travelPlanResponse.getDailyCost());
                    travelDetalPlacePlanResponse.setTotalAdults(travelPlanResponse.getTotalAdults());
                    travelDetalPlacePlanResponse.setToalChildren(travelPlanResponse.getToalChildren());

                    return travelDetalPlacePlanResponse;
                }).toList();
    }
}
