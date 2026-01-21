package com.talha.supermarket.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.talha.supermarket.model.User;
@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    List<User> findAllByRole(com.talha.supermarket.enums.Role role);
    java.util.Optional<User> findByEmail(String email);
}
