package com.talha.supermarket.model;

import java.math.BigDecimal;

import com.talha.supermarket.enums.ProductCategory;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity

public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private ProductCategory category;
    private String description;
    private BigDecimal price;
    
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;
}
