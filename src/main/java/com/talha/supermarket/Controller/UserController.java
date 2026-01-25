package com.talha.supermarket.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talha.supermarket.service.UserService;
import com.talha.supermarket.util.JwtService;
import com.talha.supermarket.dto.CreateUserDto;
import com.talha.supermarket.dto.UserDto;
import com.talha.supermarket.dto.UserLogin;
import com.talha.supermarket.enums.Role;

import lombok.RequiredArgsConstructor;

import java.util.List;

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
    public List<UserDto> getByRole(@PathVariable String role) {
        return userService.getUsersByRole(Role.valueOf(role.toUpperCase()));
    }

    @PostMapping("/register")
    public UserDto addUser(@RequestBody CreateUserDto dto) {
        return userService.Register(dto);
    }

    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable Long id, @RequestBody CreateUserDto dto) {
        return userService.updateUser(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
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
