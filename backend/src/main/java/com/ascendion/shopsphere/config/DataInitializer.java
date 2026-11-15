package com.ascendion.shopsphere.config;

import com.ascendion.shopsphere.user.entity.Role;
import com.ascendion.shopsphere.user.entity.User;
import com.ascendion.shopsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeUser("admin@shopsphere.com", "admin123", "Admin", "User", Role.ROLE_ADMIN);
        initializeUser("customer@shopsphere.com", "customer123", "John", "Doe", Role.ROLE_CUSTOMER);
        initializeUser("customer2@shopsphere.com", "customer123", "Jane", "Smith", Role.ROLE_CUSTOMER);
    }

    private void initializeUser(String email, String rawPassword, String firstName, String lastName, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .firstName(firstName)
                    .lastName(lastName)
                    .role(role)
                    .enabled(true)
                    .build();
            userRepository.save(user);
            log.info("Initialized default seed account: {} ({})", email, role);
        }
    }
}

