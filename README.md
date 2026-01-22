# Spring Security Implementation Guide

Prerequsite:
    complete Spring boot app
    error free
    controllers
    repos
    models
    DB connection
    DTOs
    Services
    Mappers
    dependencies
---

## 1. Custom Security Filter Chain
   Default SecurityFilterChain is Auto-enabled, that has all filters.
   In order to make your own:
        1. Create Package -> config
        2. In config, create class SecurityConfig.java
        3. add annotations:
            @Configuration //
            @EnableWebSecurity // helps to override defaultChain
            @EnableMethodSecurity // need this to use method-security annotations (@PreAuthorize(....))
        4. create a @bean method, having returnType SecurityFilterChain, accepting paramenters HttpSecurity and there you can do all the costumizations(e.g. choose filters you want)
    
   **V1**: define username and password in app.prop. for basicAuth and formlogin
---

## 2. User Details Servie
   Create a @Bean Method of it.
   create object(s) of type UserDetails
   return -> pass objects on InMemoryUserDetailsManager()
   **V2.1**
---

## 3. Method level Security
   you may set RBAC(Role based Access Control) on particular endpoints by adding annotations like:
       @PreAuthorize("hasAuthority('ROLE_ADMIN')")
   on that controller method
   **V2.2**
---
---
---
## 4. Basic Auth & RBAC via Database
   create a new package -> security
   in security create:
        CustomUserDetails (implements UserDetails)
        CustomUserDetailsService (implements UserDetailsService)

   in SecurityConfig:
   create a bean(dependency Injection) of CustomUserDetailsService and pass it on CustomSecurityFilterChain(.userDetailsService( here!))
   create a @Bean of PasswordEncoder
   apply passwordEncoder in UserServiceImpl -> create & update User method
---
            