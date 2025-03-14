package com.dan.dalat.services;

import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {
    Category createCategory(Category category);
    Category updateCategory(Category category, Long id);
    ResponseMessage deleteCategory(Long id);
    Category getCategoryById(Long id);
    Page<Category> getAllCategory(String keyword, Pageable pageable);
}
