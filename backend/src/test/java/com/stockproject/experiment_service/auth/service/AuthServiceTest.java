package com.stockproject.experiment_service.auth.service;

import com.stockproject.experiment_service.auth.dto.AuthResponse;
import com.stockproject.experiment_service.auth.dto.LoginRequest;
import com.stockproject.experiment_service.auth.dto.RegisterRequest;
import com.stockproject.experiment_service.auth.model.Role;
import com.stockproject.experiment_service.auth.model.User;
import com.stockproject.experiment_service.auth.repository.UserRepository;
import com.stockproject.experiment_service.auth.util.JwtUtil;
import com.stockproject.experiment_service.email.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private EmailService emailService;

    @InjectMocks private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User existingUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setEmail("john@example.com");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("john@example.com");
        loginRequest.setPassword("password123");

        existingUser = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("hashed_password")
                .role(Role.USER)
                .build();
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────

    @Test
    void register_shouldReturnAuthResponse_whenValidRequest() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(jwtUtil.generateToken(anyString())).thenReturn("mock_jwt_token");
        doNothing().when(emailService).sendWelcomeEmail(anyString(), anyString(), anyString());

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock_jwt_token");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
        assertThat(response.getRole()).isEqualTo("USER");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldThrow_whenEmailAlreadyExists() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> authService.register(registerRequest));

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_shouldStillSucceed_whenEmailServiceFails() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(jwtUtil.generateToken(anyString())).thenReturn("mock_jwt_token");
        // Email service throws — registration should not fail
        doThrow(new RuntimeException("SMTP error"))
                .when(emailService).sendWelcomeEmail(anyString(), anyString(), anyString());

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock_jwt_token");
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    @Test
    void login_shouldReturnAuthResponse_whenCredentialsAreValid() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(jwtUtil.generateToken("john@example.com")).thenReturn("mock_jwt_token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock_jwt_token");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
    }

    @Test
    void login_shouldThrow_whenUserNotFound() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> authService.login(loginRequest));
    }

    @Test
    void login_shouldThrow_whenPasswordIsWrong() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(false);

        assertThrows(BadCredentialsException.class,
                () -> authService.login(loginRequest));
    }

    // ── CHANGE PASSWORD ───────────────────────────────────────────────────────

    @Test
    void changePassword_shouldSucceed_whenCurrentPasswordIsCorrect() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("new_hashed");
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        authService.changePassword(1L, "password123", "newPassword");

        verify(userRepository).save(any(User.class));
    }

    @Test
    void changePassword_shouldThrow_whenCurrentPasswordIsWrong() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrongPassword", "hashed_password")).thenReturn(false);

        assertThrows(BadCredentialsException.class,
                () -> authService.changePassword(1L, "wrongPassword", "newPassword"));
    }
}
