package com.ascendion.shopsphere.config;

import com.ascendion.shopsphere.user.entity.Role;
import com.ascendion.shopsphere.user.entity.User;
import com.ascendion.shopsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile({"dev", "default"})
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("customer@shopsphere.com")) {
            userRepository.save(User.builder()
                    .email("customer@shopsphere.com")
                    .password(passwordEncoder.encode("customer123"))
                    .firstName("Demo")
                    .lastName("Customer")
                    .role(Role.ROLE_CUSTOMER)
                    .enabled(true)
                    .build());
            log.info("Seeded demo customer: customer@shopsphere.com / customer123");
        }

        if (!userRepository.existsByEmail("admin@shopsphere.com")) {
            userRepository.save(User.builder()
                    .email("admin@shopsphere.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("System")
                    .lastName("Administrator")
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build());
            log.info("Seeded demo administrator: admin@shopsphere.com / admin123");
        }
    }
}

