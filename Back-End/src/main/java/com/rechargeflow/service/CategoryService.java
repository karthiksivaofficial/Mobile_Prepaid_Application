package com.rechargeflow.service;

import com.rechargeflow.model.Category;
import com.rechargeflow.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Category addCategory(Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new RuntimeException("Category with name '" + category.getName() + "' already exists.");
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(String name, Category.CategoryStatus status) {
        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Category with name '" + name + "' not found."));
        category.setStatus(status);
        return categoryRepository.save(category);
    }
}