package com.talha.supermarket.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.talha.supermarket.MapStruct.StoreMapper;
import com.talha.supermarket.dto.StoreDto;
import com.talha.supermarket.model.Store;
import com.talha.supermarket.repo.StoreRepo;
import com.talha.supermarket.service.StoreService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepo storeRepo;
    private final StoreMapper mapper;

    @Override
    public StoreDto createStore(StoreDto storeDto) {
        Store store = mapper.toStore(storeDto);
        store = storeRepo.save(store);
        return mapper.toStoreDto(store);
    }

    @Override
    public StoreDto getStoreById(Long id) {
        Store store = storeRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Store not found"));
        return mapper.toStoreDto(store);
    }

    @Override
    public StoreDto updateStore(StoreDto storeDto) {
        Store existingStore = storeRepo.findById(storeDto.getId())
            .orElseThrow(() -> new RuntimeException("Store not found"));

        if (storeDto.getName() != null) existingStore.setName(storeDto.getName());
        if (storeDto.getLocation() != null) existingStore.setLocation(storeDto.getLocation());
        if (storeDto.getManagerId() != null) existingStore.setManager(mapper.toStore(storeDto).getManager());

        Store updatedStore = storeRepo.save(existingStore);
        return mapper.toStoreDto(updatedStore);
    }

    @Override
    public void deleteStore(Long id) {
        storeRepo.deleteById(id);
    }

    @Override
    public List<StoreDto> getAllStores() {
        List<Store> stores = storeRepo.findAll();
        return stores.stream().map(mapper::toStoreDto).toList();
    }

    @Override
    public List<StoreDto> getStoresByManagerId(Long managerId) {
        List<Store> stores = storeRepo.findByManagerId(managerId);
        return stores.stream().map(mapper::toStoreDto).toList();
    }
}
