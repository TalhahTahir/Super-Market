package com.talha.supermarket.model;

import java.math.BigDecimal;

import com.talha.supermarket.enums.ProductCategory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {
    private Long id;
    private String name;
    private ProductCategory category;
    private Store store;
    private String description;
    private BigDecimal price;
}
