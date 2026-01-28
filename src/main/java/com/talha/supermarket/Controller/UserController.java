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
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authMgr;

    @GetMapping("welcome")
    public String getMethodName() {
        return new String("Welcome to the Supermarket API");
    }
    
@GetMapping
public List<UserDto> getAll() {
    List<UserDto> users = userService.getAllUsers();
    System.out.println("DEBUG: Returning users: " + users);
    return users;
}

@GetMapping("/profile")
public UserDto getProfile(Authentication authentication) {
    String username = null;
    Object principal = authentication.getPrincipal();

    if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
        username = ((UserDetails) principal).getUsername();
    } else if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User) {
        OAuth2User oauth = (OAuth2User) principal;
        // prefer 'login', fall back to 'name' or 'email' local-part
        username = Optional.ofNullable((String) oauth.getAttribute("login"))
                           .orElseGet(() -> Optional.ofNullable((String) oauth.getAttribute("name"))
                                                   .orElseGet(() -> {
                                                       String email = oauth.getAttribute("email");
                                                       return email != null ? email.split("@")[0] : null;
                                                   }));
    } else {
        username = authentication.getName();
    }

    if (username == null) {
        throw new RuntimeException("Unable to resolve username from authentication principal");
    }

    System.out.println("DEBUG: Authenticated username: " + username);
    return userService.findByName(username);
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
            // fetch user to get role and include it in the token
            UserDto user = userService.findByName(login.getName());
            String role = user.getRole();
            return jwtService.generateToken(login.getName(), role);

        } else {
            throw new UsernameNotFoundException("user not authenticated, cannot generate token");
        }

    }

    @PostMapping("/login")
    public String login(@RequestBody UserLogin login) {
        return getToken(login);
    }

}
