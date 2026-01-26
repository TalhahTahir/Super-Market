package com.talha.supermarket.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talha.supermarket.service.UserService;
import com.talha.supermarket.util.JwtService;
import com.talha.supermarket.config.BadRequestException;
import com.talha.supermarket.dto.CreateUserDto;
import com.talha.supermarket.dto.UserDto;
import com.talha.supermarket.dto.UserLogin;
import com.talha.supermarket.enums.Role;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authMgr;

    @GetMapping("welcome")
    public String getMethodName() {
        return new String("Welcome to the Supermarket API");
    }
    
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<UserDto> getAll() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserDto getById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @GetMapping("/by-role")
    public List<UserDto> getByRole(@RequestParam String role) {
        try {
            return userService.getUsersByRole(Role.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + role);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> addUser(@Valid @RequestBody CreateUserDto dto) {
        return new ResponseEntity<>(userService.Register(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable Long id, @Valid @RequestBody CreateUserDto dto) {
        return userService.updateUser(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth")
    public String getToken(@RequestBody UserLogin login) {

        Authentication auth = authMgr
                .authenticate(new UsernamePasswordAuthenticationToken(login.getName(), login.getPassword()));

        if (auth.isAuthenticated()) {
            return jwtService.generateToken(login.getName());

        } else {
            throw new UsernameNotFoundException("user not authenticated, cannot generate token");
        }

    }

}
