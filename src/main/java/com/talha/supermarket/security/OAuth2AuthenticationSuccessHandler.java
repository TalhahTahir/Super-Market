package com.talha.supermarket.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.talha.supermarket.enums.Role;
import com.talha.supermarket.model.User;
import com.talha.supermarket.repo.UserRepo;
import com.talha.supermarket.util.JwtService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public OAuth2AuthenticationSuccessHandler(JwtService jwtService, UserRepo userRepo, @Lazy PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        // GitHub provides "login" as the username
        String username = oAuth2User.getAttribute("login");
        String email = oAuth2User.getAttribute("email");
        
        if (username == null) {
            username = email;
            if (username == null) {
                username = oAuth2User.getAttribute("name");
            }
        }

        // Create or find user in database
        Optional<User> existingUser = userRepo.findByName(username);
        if (existingUser.isEmpty()) {
            // Create new user from OAuth2
            User newUser = new User();
            newUser.setName(username);
            newUser.setEmail(email != null ? email : username + "@github.com");
            newUser.setPassword(passwordEncoder.encode("oauth2_" + System.currentTimeMillis()));
            newUser.setRole(Role.CUSTOMER); // Default role for OAuth2 users
            userRepo.save(newUser);
        }

        // Determine role to include in token
        String roleStr;
        if (existingUser.isPresent()) {
            roleStr = existingUser.get().getRole().name();
        } else {
            roleStr = Role.CUSTOMER.name();
        }

        // Generate JWT token
        String token = jwtService.generateToken(username, roleStr);

        // Redirect to frontend with token in URL (frontend will store it)
        String redirectUrl = "/oauth2/callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8) 
                            + "&username=" + URLEncoder.encode(username, StandardCharsets.UTF_8);
        response.sendRedirect(redirectUrl);
    }
}
