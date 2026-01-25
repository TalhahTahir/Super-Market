package com.talha.supermarket.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.talha.supermarket.util.JwtService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        // GitHub provides "login" as the username
        String username = oAuth2User.getAttribute("login");
        if (username == null) {
            // Fallback to email or name if login is not available
            username = oAuth2User.getAttribute("email");
            if (username == null) {
                username = oAuth2User.getAttribute("name");
            }
        }

        // Generate JWT token
        String token = jwtService.generateToken(username);

        // Return the token in the response
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"token\": \"" + token + "\", \"username\": \"" + username + "\"}");
        response.getWriter().flush();
    }
}
