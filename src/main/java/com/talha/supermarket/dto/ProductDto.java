package com.talha.supermarket.dto;

import java.math.BigDecimal;

import com.talha.supermarket.enums.ProductCategory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private ProductCategory category;
    private Long storeId;
    private String description;
    private BigDecimal price;
}
