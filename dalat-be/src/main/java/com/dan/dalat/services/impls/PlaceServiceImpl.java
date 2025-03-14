package com.dan.dalat.services.impls;

import com.dan.dalat.dtos.requests.PlaceRequest;
import com.dan.dalat.dtos.requests.RecommendRequest;
import com.dan.dalat.dtos.responses.LocationResponse;
import com.dan.dalat.dtos.responses.RecommendResponse;
import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.http_clients.FilterClient;
import com.dan.dalat.models.Category;
import com.dan.dalat.models.Place;
import com.dan.dalat.models.User;
import com.dan.dalat.repositories.*;
import com.dan.dalat.services.FileUploadService;
import com.dan.dalat.services.PlaceService;
import com.dan.dalat.utils.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlaceServiceImpl implements PlaceService {
    @Autowired
    private PlaceRepository placeRepository;
    @Autowired
    private FileUploadService fileUploadService;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private HobbyRepository hobbyRepository;
    @Autowired
    private FilterClient filterClient;
    @Autowired
    private ClientService clientService;
    @Autowired
    private TourismServiceRepository tourismServiceRepository;

    @Override
    public Place createPlace(PlaceRequest placeRequest, String username) {
        Category category = categoryRepository.findById(placeRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        User user = userRepository.findByUsername(username);

        Place place = new Place();
        place.setName(placeRequest.getName());
        place.setCategory(category);
        place.setAddress(placeRequest.getAddress());
        place.setLatitude(placeRequest.getLatitude());
        place.setLongitude(placeRequest.getLongitude());
        place.setRating(0.0);
        place.setDescription(placeRequest.getDescription());
        place.setShow(placeRequest.isShow());
        place.setAdultFare(placeRequest.getAdultFare());
        place.setChildFare(placeRequest.getChildFare());
        place.setOpenTime(placeRequest.getOpenTime());
        place.setCloseTime(placeRequest.getCloseTime());
        place.setCreator(user);

        place.setHobbies(placeRequest.getHobbyIds().stream().map(
                hobbyId -> hobbyRepository.findById(hobbyId).orElseThrow(() -> new RuntimeException("Không tìm thấy sở thích")))
                .collect(Collectors.toSet())
        );

        place.setServices(placeRequest.getServiceIds().stream().map(
                tourismServiceId -> tourismServiceRepository.findById(tourismServiceId).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ du lịch")))
                .collect(Collectors.toSet())
        );

        MultipartFile image = placeRequest.getImage();
        if (image != null) {
            try {
                place.setImageCode(fileUploadService.uploadFile(image).getFileCode());
            } catch (Exception e) {
                throw new RuntimeException("Lỗi lưu ảnh: " + e.getMessage());
            }
        }

        List<MultipartFile> images = placeRequest.getImages();
        if (images != null) {
            try {
                place.setOtherImages(images.stream().map(imageFile -> {
                    try {
                        return fileUploadService.uploadFile(imageFile).getFileCode();
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }).collect(Collectors.toList()));
            } catch (Exception e) {
                throw new RuntimeException("Lỗi lưu ảnh: " + e.getMessage());
            }
        }

        return placeRepository.save(place);
    }

    @Override
    public Place updatePlace(Long placeId, PlaceRequest placeRequest) {
        return placeRepository.findById(placeId)
                .map(place -> {
                    Category category = categoryRepository.findById(placeRequest.getCategoryId())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

                    place.setName(placeRequest.getName());
                    place.setCategory(category);
                    place.setAddress(placeRequest.getAddress());
                    place.setLatitude(placeRequest.getLatitude());
                    place.setLongitude(placeRequest.getLongitude());
                    place.setDescription(placeRequest.getDescription());
                    place.setShow(placeRequest.isShow());
                    place.setAdultFare(placeRequest.getAdultFare());
                    place.setChildFare(placeRequest.getChildFare());
                    place.setOpenTime(placeRequest.getOpenTime());
                    place.setCloseTime(placeRequest.getCloseTime());

                    place.setHobbies(placeRequest.getHobbyIds().stream().map(
                            hobbyId -> hobbyRepository.findById(hobbyId).orElseThrow(() -> new RuntimeException("Không tìm thấy sở thích")))
                            .collect(Collectors.toSet())
                    );

                    place.setServices(placeRequest.getServiceIds().stream().map(
                            tourismServiceId -> tourismServiceRepository.findById(tourismServiceId).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ du lịch")))
                            .collect(Collectors.toSet())
                    );

                    MultipartFile image = placeRequest.getImage();
                    if (image != null) {
                        try {
                            String oldFileCode = place.getImageCode();
                            place.setImageCode(fileUploadService.uploadFile(image).getFileCode());

                            if (oldFileCode != null) {
                                fileUploadService.deleteFileByFileCode(oldFileCode);
                            }
                        } catch (Exception e) {
                            throw new RuntimeException("Lỗi lưu ảnh: " + e.getMessage());
                        }
                    }

                    List<MultipartFile> images = placeRequest.getImages();

                    if (images != null) {
                        try {
                            List<String> oldFileCodes = place.getOtherImages();
                            place.setOtherImages(images.stream().map(imageFile -> {
                                try {
                                    return fileUploadService.uploadFile(imageFile).getFileCode();
                                } catch (IOException e) {
                                    throw new RuntimeException(e);
                                }
                            }).collect(Collectors.toList()));

                            if (oldFileCodes != null) {
                                oldFileCodes.forEach(oldFileCode -> {
                                    try {
                                        fileUploadService.deleteFileByFileCode(oldFileCode);
                                    } catch (Exception e) {
                                        throw new RuntimeException("Lỗi xóa ảnh: " + e.getMessage());
                                    }
                                });
                            }
                        } catch (Exception e) {
                            throw new RuntimeException("Lỗi lưu ảnh: " + e.getMessage());
                        }
                    }

                    return placeRepository.save(place);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));
    }

    @Override
    public ResponseMessage deletePlace(Long placeId) {
        return placeRepository.findById(placeId)
                .map(place -> {
                    placeRepository.delete(place);
                    if (place.getImageCode() != null) {
                        try {
                            fileUploadService.deleteFileByFileCode(place.getImageCode());
                        } catch (Exception e) {
                            throw new RuntimeException("Lỗi xóa ảnh: " + e.getMessage());
                        }
                    }

                    if (place.getOtherImages() != null) {
                        place.getOtherImages().forEach(fileCode -> {
                            try {
                                fileUploadService.deleteFileByFileCode(fileCode);
                            } catch (Exception e) {
                                throw new RuntimeException("Lỗi xóa ảnh: " + e.getMessage());
                            }
                        });
                    }
                    return new ResponseMessage(200, "Xóa địa điểm thành công");
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));
    }

    @Override
    public Place getPlaceById(Long placeId) {
        return placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));
    }

    @Override
    public Page<Place> getAllPlaces(String keyword, Pageable pageable) {
        return placeRepository.findByNameContainingOrCategory_NameContaining(keyword, keyword, pageable);
    }

    @Override
    public List<Place> getAllPlaces() {
        return placeRepository.findAll();
    }

    @Override
    public Place updateShowPlace(Long placeId) {
        return placeRepository.findById(placeId)
                .map(place -> {
                    place.setShow(!place.isShow());
                    return placeRepository.save(place);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));
    }

    @Override
    public Page<Place> getPlacesRecommend(RecommendRequest recommendRequest, Pageable pageable, String username) {
        System.out.println("recommendRequest.getUserLat()" + recommendRequest.getUserLat());
        System.out.println("recommendRequest.getPrice()" + recommendRequest.getPrice());
        Long userId = username != null ? userRepository.findByUsername(username).getId() : null;
        recommendRequest.setUserId(userId);
        System.out.println("recommendRequest.getUserLat()" + recommendRequest.getUserLat());
        System.out.println("recommendRequest.getPrice()" + recommendRequest.getPrice());
        List<RecommendResponse> recommendResponse = filterClient.getRecommendations(pageable.getPageNumber(), pageable.getPageSize(), recommendRequest);
        List<Place> places = recommendResponse.stream().map(
                recommend -> placeRepository.findById(recommend.getId()).orElse(null)).toList();
        return new PageImpl<>(places, pageable, places.size());
    }

    @Override
    public LocationResponse lookupPlace(String keyword) {
        return clientService.getLocationByAddress(keyword);
    }
}
