package com.talha.supermarket.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talha.supermarket.dto.StoreDto;
import com.talha.supermarket.service.StoreService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/stores")
public class StoreController {

    private final StoreService storeService;

    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @GetMapping
    public List<StoreDto> getAll() {
        return storeService.getAllStores();
    }

    @PreAuthorize("hasAuthority('ROLE_SELLER') or hasAuthority('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public StoreDto getById(@PathVariable Long id) {
        return storeService.getStoreById(id);
    }

    @GetMapping("/by-manager/{managerId}")
    public List<StoreDto> getByManagerId(@PathVariable Long managerId) {
        return storeService.getStoresByManagerId(managerId);
    }

    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @PostMapping("/create")
    public ResponseEntity<StoreDto> createStore(@Valid @RequestBody StoreDto dto) {
        return new ResponseEntity<>(storeService.createStore(dto), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @PutMapping("/{id}")
    public StoreDto updateStore(@PathVariable Long id, @Valid @RequestBody StoreDto dto) {
        dto.setId(id);
        return storeService.updateStore(dto);
    }

    @PreAuthorize("hasAuthority('ROLE_SELLER') or hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id) {
        storeService.deleteStore(id);
        return ResponseEntity.noContent().build();
    }
}
