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
2. Create class → [`SecurityConfig.java`](src/main/java/com/talha/supermarket/config/SecurityConfig.java)
3. Add annotations:
   - `@Configuration`
   - `@EnableWebSecurity` – Helps override default chain
   - `@EnableMethodSecurity` – Enables method-security annotations

4. Create a `@Bean` method:
   - Return type: `SecurityFilterChain`
   - Parameter: `HttpSecurity`
   - Configure your custom filters here

📌 **V1**: Define username and password in [`application.properties`](src/main/resources/application.properties) for Basic Auth and Form Login.

---

## 2. User Details Service

### Steps:

1. Create a `@Bean` method for `UserDetailsService`
2. Create object(s) of type `UserDetails`
3. Return → `new InMemoryUserDetailsManager(userDetails)`

📌 **V2.1**

---

## 3. Method-Level Security (RBAC)

> Set Role-Based Access Control on specific endpoints using annotations.

### Steps:

1. Use `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` on controller methods
2. Requires `@EnableMethodSecurity` in [`SecurityConfig.java`](src/main/java/com/talha/supermarket/config/SecurityConfig.java)

📌 **V2.2**

---

## 4. Basic Auth & RBAC via Database

### Steps:

1. Create package → `security`

2. Create the following classes:
   | Class | Implements |
   |-------|------------|
   | [`CustomUserDetails`](src/main/java/com/talha/supermarket/security/CustomUserDetails.java) | `UserDetails` |
   | [`CustomUserDetailsService`](src/main/java/com/talha/supermarket/security/CustomUserDetailService.java) | `UserDetailsService` |

3. In [`SecurityConfig`](src/main/java/com/talha/supermarket/config/SecurityConfig.java):
   - Inject `CustomUserDetailsService`
   - Pass it to the filter chain: `.userDetailsService(customUserDetailsService)`
   - Create a `@Bean` for `PasswordEncoder`

4. In [`UserServiceImpl`](src/main/java/com/talha/supermarket/service/impl/UserServiceImpl.java):
   - Apply `PasswordEncoder` in **create** and **update** user methods

---

## 5. JWT X DB

### Steps:

1. **Create [`JwtService`](src/main/java/com/talha/supermarket/util/JwtService.java)** in `util` package:
   - Token creation and generation method
   - Data extraction methods (username, expiration)
   - Token validation method

2. **Create [`JwtAuthFilter`](src/main/java/com/talha/supermarket/util/JwtAuthFilter.java)** in `util` package:
   - Extend `OncePerRequestFilter`
   - Implement `doFilterInternal` method
   - Extract token from `Authorization` header
   - Validate and set authentication in `SecurityContext`

3. **Update [`SecurityConfig`](src/main/java/com/talha/supermarket/config/SecurityConfig.java)**:
   - Inject `JwtAuthFilter`
   - Create a `@Bean` of `AuthenticationManager`
   - Replace form/Basic Auth with `SessionCreationPolicy.STATELESS`
   - Add filter: `.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`

4. **Create login endpoint** in [`UserController`](src/main/java/com/talha/supermarket/Controller/UserController.java):
   - Accept username and password
   - Authenticate using `AuthenticationManager`
   - Return JWT token from `JwtService`

---

## 6. OAuth2 X JWT X DB

> Integrate OAuth2 (e.g., GitHub) with JWT for stateless authentication.

### Steps:

1. **Add Dependency** for OAuth2 client in [`pom.xml`](pom.xml)

2. **Configure OAuth2 Provider** in [`application.properties`](src/main/resources/application.properties):
   ```properties
   spring.security.oauth2.client.registration.github.client-id=YOUR_CLIENT_ID
   spring.security.oauth2.client.registration.github.client-secret=YOUR_CLIENT_SECRET
   ```

3. **Create [`OAuth2AuthenticationSuccessHandler`](src/main/java/com/talha/supermarket/security/OAuth2AuthenticationSuccessHandler.java)** in `security` package:
   - Extend `SimpleUrlAuthenticationSuccessHandler`
   - Override `onAuthenticationSuccess` method
   - Extract username from `OAuth2User` principal
   - Generate JWT token using `JwtService`
   - Return token in JSON response

4. **Update [`SecurityConfig`](src/main/java/com/talha/supermarket/config/SecurityConfig.java)**:
   - Inject `OAuth2AuthenticationSuccessHandler`
   - Configure OAuth2 login with success handler

### Flow:

1. User hits a protected endpoint → Redirected to GitHub login
2. User authenticates with GitHub
3. Success handler generates JWT token and returns it
4. User uses JWT token in `Authorization: Bearer <token>` header for subsequent requests

---

## 7. Exception Handling & Validation

> Implement global exception handling and input validation for consistent API responses.

### Steps:

1. **Add Validation Dependency** in [`pom.xml`](pom.xml):
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-validation</artifactId>
   </dependency>
   ```

2. **Create Custom Exceptions** in `config` package:
   | Class | Purpose |
   |-------|---------|
   | [`ResourceNotFoundException`](src/main/java/com/talha/supermarket/config/ResourceNotFoundException.java) | When entity not found (404) |
   | [`BadRequestException`](src/main/java/com/talha/supermarket/config/BadRequestException.java) | Invalid input data (400) |
   | [`DuplicateResourceException`](src/main/java/com/talha/supermarket/config/DuplicateResourceException.java) | Duplicate entry (409) |

3. **Create [`ErrorResponse`](src/main/java/com/talha/supermarket/config/ErrorResponse.java)** DTO:
   - Contains: timestamp, status, error, message, path, validationErrors

4. **Create [`GlobalExceptionHandler`](src/main/java/com/talha/supermarket/config/GlobalExceptionHandler.java)**:
   - Annotate with `@RestControllerAdvice`
   - Handle all custom and common exceptions
   - Return consistent `ErrorResponse` structure

5. **Add Validation Annotations** to DTOs:
   - [`CreateUserDto`](src/main/java/com/talha/supermarket/dto/CreateUserDto.java): `@NotBlank`, `@Email`, `@Size`
   - [`ProductDto`](src/main/java/com/talha/supermarket/dto/ProductDto.java): `@NotBlank`, `@NotNull`, `@DecimalMin`
   - [`StoreDto`](src/main/java/com/talha/supermarket/dto/StoreDto.java): `@NotBlank`, `@NotNull`, `@Size`

6. **Update Controllers** with `@Valid` annotation on `@RequestBody` parameters

### Error Response Format:

```json
{
    "timestamp": "2024-01-26T12:00:00",
    "status": 404,
    "error": "Not Found",
    "message": "User not found with id: 1",
    "path": "/users/1",
    "validationErrors": null
}
```

### Validation Error Response:

```json
{
    "timestamp": "2024-01-26T12:00:00",
    "status": 400,
    "error": "Validation Failed",
    "message": "Input validation failed",
    "path": "/users/register",
    "validationErrors": {
        "email": "Invalid email format",
        "password": "Password must be at least 6 characters"
    }
}
```
