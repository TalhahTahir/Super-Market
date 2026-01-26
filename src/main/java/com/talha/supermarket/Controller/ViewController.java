package com.talha.supermarket.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller for serving Thymeleaf views.
 * Handles routing for all frontend pages.
 */
@Controller
public class ViewController {

    // ==================== Authentication Pages ====================

    @GetMapping("/")
    public String index() {
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/oauth2/callback")
    public String oauth2Callback() {
        return "oauth2-callback";
    }

    // ==================== Dashboard ====================

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    // ==================== Profile ====================

    @GetMapping("/profile")
    public String profile() {
        return "profile";
    }

    // ==================== User Management ====================

    @GetMapping("/users")
    public String usersList() {
        return "users/list";
    }

    // ==================== Store Management ====================

    @GetMapping("/stores")
    public String storesList() {
        return "stores/list";
    }

    // ==================== Product Management ====================

    @GetMapping("/products")
    public String productsList() {
        return "products/list";
    }
}
