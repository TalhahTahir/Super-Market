package com.talha.supermarket.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.talha.supermarket.model.Store;

@Repository
public interface StoreRepo extends JpaRepository<Store, Long> {
    List<Store> findByManagerId(Long managerId);
}
