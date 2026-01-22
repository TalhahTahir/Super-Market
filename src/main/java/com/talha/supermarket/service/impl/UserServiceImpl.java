package com.talha.supermarket.service.impl;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.talha.supermarket.MapStruct.UserMapper;
import com.talha.supermarket.dto.CreateUserDto;
import com.talha.supermarket.dto.UserDto;
import com.talha.supermarket.enums.Role;
import com.talha.supermarket.model.User;
import com.talha.supermarket.repo.UserRepo;
import com.talha.supermarket.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDto Register(CreateUserDto Dto) {
        User u = mapper.toUser(Dto);
        u.setPassword(passwordEncoder.encode(u.getPassword()));
        u = userRepo.save(u);
        return mapper.toUserDto(u);
    }

    @Override
    public UserDto findById(Long id) {
        User u = userRepo.findById(id).orElseThrow(()-> new RuntimeException("User not found"));
        return mapper.toUserDto(u);
    }

    @Override
    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    @Override
    public List<UserDto> getUsersByRole(Role role) {
        List<User> users = userRepo.findAllByRole(role);
        return users.stream().map(mapper::toUserDto).toList();
    }

    @Override
    public List<UserDto> getAllUsers() {
        List<User> users = userRepo.findAll();
        return users.stream().map(mapper::toUserDto).toList();
    }

    @Override
    public UserDto updateUser(Long id, CreateUserDto dto) {
        User existingUser = userRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getName() != null) existingUser.setName(dto.getName());
        if (dto.getEmail() != null) existingUser.setEmail(dto.getEmail());
        if (dto.getRole() != null) existingUser.setRole(mapper.stringToRole(dto.getRole()));
        if (dto.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        User updatedUser = userRepo.save(existingUser);
        return mapper.toUserDto(updatedUser);
    }
    
}
