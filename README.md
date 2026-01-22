# Spring Security Implementation Guide

## Prerequisites

Before implementing Spring Security, ensure you have:

- ✅ Complete Spring Boot application (error-free)
- ✅ Controllers
- ✅ Repositories
- ✅ Models
- ✅ Database connection
- ✅ DTOs
- ✅ Services
- ✅ Mappers
- ✅ Required dependencies

---

## 1. Custom Security Filter Chain

> Default `SecurityFilterChain` is auto-enabled with all filters. To customize it:

### Steps:

1. Create package → `config`
2. Create class → `SecurityConfig.java`
3. Add annotations:
   ```java
   @Configuration
   @EnableWebSecurity        // Helps override default chain
   @EnableMethodSecurity     // Enables method-security annotations (@PreAuthorize)
   ```
4. Create a `@Bean` method:
   - Return type: `SecurityFilterChain`
   - Parameter: `HttpSecurity`
   - Configure your custom filters here

📌 **V1**: Define username and password in `application.properties` for Basic Auth and Form Login.

---

## 2. User Details Service

### Steps:

1. Create a `@Bean` method for `UserDetailsService`
2. Create object(s) of type `UserDetails`
3. Return → `new InMemoryUserDetailsManager(userDetails)`

📌 **V2.1**

---

## 3. Method-Level Security (RBAC)

Set **Role-Based Access Control** on specific endpoints using annotations:

```java
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public ResponseEntity<?> adminEndpoint() {
    // Only accessible by ADMIN role
}
```

📌 **V2.2**

---

## 4. Basic Auth & RBAC via Database

### Steps:

1. Create package → `security`

2. Create the following classes:
   | Class | Implements |
   |-------|------------|
   | `CustomUserDetails` | `UserDetails` |
   | `CustomUserDetailsService` | `UserDetailsService` |

3. In `SecurityConfig`:
   - Inject `CustomUserDetailsService` as a bean
   - Pass it to the filter chain: `.userDetailsService(customUserDetailsService)`
   - Create a `@Bean` for `PasswordEncoder`

4. In `UserServiceImpl`:
   - Apply `PasswordEncoder` in **create** and **update** user methods

---
            