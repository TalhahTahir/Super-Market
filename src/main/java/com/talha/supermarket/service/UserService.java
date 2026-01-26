package com.talha.supermarket.service;

import java.util.List;

import com.talha.supermarket.dto.CreateUserDto;
import com.talha.supermarket.dto.UserDto;
import com.talha.supermarket.enums.Role;
public interface UserService {

    UserDto Register(CreateUserDto createUserDto);
    UserDto findById(Long id);
    UserDto findByName(String name);
    void deleteUser(Long id);
    List<UserDto>getUsersByRole(Role role);
    List<UserDto> getAllUsers();
    UserDto updateUser(Long id, CreateUserDto dto);
    

    
}
