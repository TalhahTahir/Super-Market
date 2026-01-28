package com.talha.supermarket.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.talha.supermarket.MapStruct.StoreMapper;
import com.talha.supermarket.config.ResourceNotFoundException;
import com.talha.supermarket.dto.StoreDto;
import com.talha.supermarket.model.Store;
import com.talha.supermarket.repo.StoreRepo;
import com.talha.supermarket.repo.UserRepo;
import com.talha.supermarket.service.StoreService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepo storeRepo;
    private final StoreMapper mapper;
    private final UserRepo userRepo;

    @Override
    public StoreDto createStore(StoreDto storeDto) {
        Store store = mapper.toStore(storeDto);
        Store savedStore = storeRepo.save(store);
        StoreDto dtoResult = mapper.toStoreDto(savedStore);
        dtoResult.setManagerName(userRepo.findById(savedStore.getManager().getId()).orElseThrow(() -> new ResourceNotFoundException("User", savedStore.getManager().getId())).getName());
        return dtoResult;
    }

    @Override
    public StoreDto getStoreById(Long id) {
        Store store = storeRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Store", id));
        StoreDto dtoResult = mapper.toStoreDto(store);
        dtoResult.setManagerName(userRepo.findById(store.getManager().getId()).orElseThrow(() -> new ResourceNotFoundException("User", store.getManager().getId())).getName());
        return dtoResult;
    }

    @Override
    public StoreDto updateStore(StoreDto storeDto) {
        Store existingStore = storeRepo.findById(storeDto.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Store", storeDto.getId()));

        if (storeDto.getName() != null) existingStore.setName(storeDto.getName());
        if (storeDto.getLocation() != null) existingStore.setLocation(storeDto.getLocation());
        if (storeDto.getManagerId() != null) existingStore.setManager(mapper.toStore(storeDto).getManager());

        Store updatedStore = storeRepo.save(existingStore);
        StoreDto dtoResult = mapper.toStoreDto(updatedStore);
        dtoResult.setManagerName(userRepo.findById(updatedStore.getManager().getId()).orElseThrow(() -> new ResourceNotFoundException("User", updatedStore.getManager().getId())).getName());
        return dtoResult;
    }

    @Override
    public void deleteStore(Long id) {
        if (!storeRepo.existsById(id)) {
            throw new ResourceNotFoundException("Store", id);
        }
        storeRepo.deleteById(id);
    }

    @Override
    public List<StoreDto> getAllStores() {
        List<Store> stores = storeRepo.findAll();
        return stores.stream().map(store -> {
            StoreDto dto = mapper.toStoreDto(store);
            dto.setManagerName(userRepo.findById(store.getManager().getId()).orElseThrow(() -> new ResourceNotFoundException("User", store.getManager().getId())).getName());
            return dto;
        }).toList();
    }

    @Override
    public List<StoreDto> getStoresByManagerId(Long managerId) {
        List<Store> stores = storeRepo.findByManagerId(managerId);
        return stores.stream().map(store -> {
            StoreDto dto = mapper.toStoreDto(store);
            dto.setManagerName(userRepo.findById(store.getManager().getId()).orElseThrow(() -> new ResourceNotFoundException("User", store.getManager().getId())).getName());
            return dto;
        }).toList();
    }
}
