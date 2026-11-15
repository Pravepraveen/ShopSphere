package com.ascendion.shopsphere.auth;

import com.ascendion.shopsphere.auth.dto.AuthResponse;
import com.ascendion.shopsphere.auth.dto.LoginRequest;
import com.ascendion.shopsphere.auth.dto.RegisterRequest;
import com.ascendion.shopsphere.auth.jwt.JwtService;
import com.ascendion.shopsphere.auth.service.AuthService;
import com.ascendion.shopsphere.common.exception.BadRequestException;
import com.ascendion.shopsphere.user.entity.Role;
import com.ascendion.shopsphere.user.entity.User;
import com.ascendion.shopsphere.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encoded_pass")
                .firstName("Test")
                .lastName("User")
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("Successfully register a new customer")
    void shouldRegisterNewCustomer() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(anyMap(), any(User.class))).thenReturn("mock-jwt-token");

        RegisterRequest request = RegisterRequest.builder()
                .email("test@example.com")
                .password("secret123")
                .firstName("Test")
                .lastName("User")
                .build();

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getRole()).isEqualTo(Role.ROLE_CUSTOMER);
    }

    @Test
    @DisplayName("Reject registration if email already exists")
    void shouldRejectDuplicateEmailRegistration() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        RegisterRequest request = RegisterRequest.builder()
                .email("test@example.com")
                .password("secret123")
                .firstName("Test")
                .lastName("User")
                .build();

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Successfully authenticate valid credentials and issue JWT")
    void shouldLoginSuccessfully() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(anyMap(), any(User.class))).thenReturn("valid-login-jwt");

        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("secret123")
                .build();

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("valid-login-jwt");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
    }
}

