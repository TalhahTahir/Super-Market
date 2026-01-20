package com.talha.supermarket.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.talha.supermarket.dto.ProductDto;
import com.talha.supermarket.service.ProductService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductDto> getAll() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ProductDto getById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping("/by-category")
    public List<ProductDto> getByCategory(@RequestParam String category) {
        return productService.getProductsByCategory(category);
    }

    @GetMapping("/by-store/{storeId}")
    public List<ProductDto> getByStoreId(@PathVariable Long storeId) {
        return productService.getProductsByStoreId(storeId);
    }

    @GetMapping("/search")
    public List<ProductDto> searchByName(@RequestParam String name) {
        return productService.searchProductsByName(name);
    }

    @GetMapping("/by-category-and-store")
    public List<ProductDto> getByCategoryAndStore(@RequestParam String category, @RequestParam Long storeId) {
        return productService.getProductsByCategoryAndStoreId(category, storeId);
    }

    @PostMapping
    public ProductDto addProduct(@RequestBody ProductDto dto) {
        return productService.addProduct(dto);
    }

    @PutMapping("/{id}")
    public ProductDto updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        return productService.updateProduct(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
