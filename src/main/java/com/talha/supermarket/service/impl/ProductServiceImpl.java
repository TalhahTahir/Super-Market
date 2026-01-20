package com.talha.supermarket.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.talha.supermarket.MapStruct.ProductMapper;
import com.talha.supermarket.dto.ProductDto;
import com.talha.supermarket.enums.ProductCategory;
import com.talha.supermarket.model.Product;
import com.talha.supermarket.repo.ProductRepo;
import com.talha.supermarket.service.ProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepo productRepo;
    private final ProductMapper mapper;

    @Override
    public ProductDto addProduct(ProductDto proDto) {
        Product product = mapper.toProduct(proDto);
        product = productRepo.save(product);
        return mapper.toProductDto(product);
    }

    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapper.toProductDto(product);
    }

    @Override
    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepo.findAll();
        return products.stream().map(mapper::toProductDto).toList();
    }

    @Override
    public ProductDto updateProduct(Long id, ProductDto proDto) {
        Product existingProduct = productRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        if (proDto.getName() != null) existingProduct.setName(proDto.getName());
        if (proDto.getCategory() != null) existingProduct.setCategory(proDto.getCategory());
        if (proDto.getDescription() != null) existingProduct.setDescription(proDto.getDescription());
        if (proDto.getPrice() != null) existingProduct.setPrice(proDto.getPrice());
        if (proDto.getStoreId() != null) existingProduct.setStore(mapper.toProduct(proDto).getStore());

        Product updatedProduct = productRepo.save(existingProduct);
        return mapper.toProductDto(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    @Override
    public List<ProductDto> getProductsByCategory(String category) {
        ProductCategory productCategory = ProductCategory.valueOf(category.toUpperCase());
        List<Product> products = productRepo.findByCategory(productCategory);
        return products.stream().map(mapper::toProductDto).toList();
    }

    @Override
    public List<ProductDto> getProductsByStoreId(Long storeId) {
        List<Product> products = productRepo.findByStoreId(storeId);
        return products.stream().map(mapper::toProductDto).toList();
    }

    @Override
    public List<ProductDto> searchProductsByName(String name) {
        List<Product> products = productRepo.findByNameContainingIgnoreCase(name);
        return products.stream().map(mapper::toProductDto).toList();
    }

    @Override
    public List<ProductDto> getProductsByCategoryAndStoreId(String category, Long storeId) {
        ProductCategory productCategory = ProductCategory.valueOf(category.toUpperCase());
        List<Product> products = productRepo.findByCategoryAndStoreId(productCategory, storeId);
        return products.stream().map(mapper::toProductDto).toList();
    }
}
