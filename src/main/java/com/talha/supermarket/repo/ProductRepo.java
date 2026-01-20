package com.talha.supermarket.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.talha.supermarket.enums.ProductCategory;
import com.talha.supermarket.model.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    List<Product> findByCategory(ProductCategory category);
    List<Product> findByStoreId(Long storeId);
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategoryAndStoreId(ProductCategory category, Long storeId);
}
