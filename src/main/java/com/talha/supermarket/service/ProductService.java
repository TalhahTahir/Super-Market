package com.talha.supermarket.service;

import java.util.List;

import com.talha.supermarket.dto.ProductDto;

public interface ProductService {
    ProductDto addProduct(ProductDto proDto);
    ProductDto getProductById(Long id);
    List<ProductDto> getAllProducts();
    ProductDto updateProduct(Long id, ProductDto proDto);
    void deleteProduct(Long id);
    List<ProductDto> getProductsByCategory(String category);
    List<ProductDto> getProductsByStoreId(Long storeId);
    List<ProductDto> searchProductsByName(String name);
    List<ProductDto> getProductsByCategoryAndStoreId(String category, Long storeId);
}
