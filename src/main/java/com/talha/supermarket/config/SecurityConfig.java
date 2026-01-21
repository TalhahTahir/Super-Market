package com.talha.supermarket.config;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;


import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@EnableWebSecurity
@EnableMethodSecurity
@Configuration
public class SecurityConfig {
    
    @Bean
    SecurityFilterChain customSecurityFilterChain(HttpSecurity http)throws Exception{
        http
            // .csrf(AbstractHttpConfigurer::disable)
            // .authorizeHttpRequests(auth -> auth
            //     .requestMatchers("/api/auth/**").permitAll()
            //     .anyRequest().authenticated()
            // )
            .authorizeHttpRequests((r) -> r.anyRequest().authenticated())
            .formLogin(withDefaults())
            .httpBasic(withDefaults());
        return http.build();

    }

    @Bean
    UserDetailsService UserDetailsService(){

        UserDetails admin = User
            .withUsername("Talha")
            .password("{noop}2011") // {noop} means no password encoder is used
            .roles("ADMIN")
            .build();

        UserDetails user = User
            .withUsername("Ali")
            .password("{noop}abc") // {noop} means no password encoder is used
            .roles("USER")
            .build();
    
        return new InMemoryUserDetailsManager(admin, user);
        }
}
