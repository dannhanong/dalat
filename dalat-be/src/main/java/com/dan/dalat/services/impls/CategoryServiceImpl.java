package com.dan.dalat.services.impls;

import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Category;
import com.dan.dalat.repositories.CategoryRepository;
import com.dan.dalat.repositories.PlaceRepository;
import com.dan.dalat.repositories.TourismServiceRepository;
import com.dan.dalat.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private PlaceRepository placeRepository;
    @Autowired
    private TourismServiceRepository tourismServiceRepository;

    @Override
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Category category, Long id) {
        return categoryRepository.findById(id)
                .map(category1 -> {
                    category1.setName(category.getName());
                    return categoryRepository.save(category1);
                })
                .orElseGet(() -> {
                    category.setId(id);
                    return categoryRepository.save(category);
                });
    }

    @Override
    public ResponseMessage deleteCategory(Long id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    placeRepository.findByCategory_Id(category.getId()).forEach(place -> {
                        place.setCategory(null);
                        placeRepository.save(place);
                    });

                    tourismServiceRepository.findByCategory_Id(category.getId()).forEach(tourismService -> {
                        tourismService.setCategory(null);
                        tourismServiceRepository.save(tourismService);
                    });
                    
                    categoryRepository.delete(category);
                    return new ResponseMessage(200, "Xóa thành công");
                })
                .orElseGet(() -> new ResponseMessage(401, "Không tìm thấy danh mục"));
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
    }

    @Override
    public Page<Category> getAllCategory(String keyword, Pageable pageable) {
        return categoryRepository.findByNameContainingIgnoreCase(keyword, pageable);
    }
}
