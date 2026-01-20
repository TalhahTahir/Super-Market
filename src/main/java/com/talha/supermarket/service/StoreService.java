package com.talha.supermarket.service;

import java.util.List;

import com.talha.supermarket.dto.StoreDto;

public interface StoreService {
    
    StoreDto createStore(StoreDto store);
    StoreDto getStoreById(Long id);
    StoreDto updateStore(StoreDto store);
    void deleteStore(Long id);
    List<StoreDto> getAllStores();
    List<StoreDto> getStoresByManagerId(Long managerId);
    
}
