package com.stockproject.experiment_service.auth.service;

import com.stockproject.experiment_service.auth.dto.AuthResponse;
import com.stockproject.experiment_service.auth.dto.LoginRequest;
import com.stockproject.experiment_service.auth.dto.RegisterRequest;
import com.stockproject.experiment_service.auth.model.Role;
import com.stockproject.experiment_service.auth.model.User;
import com.stockproject.experiment_service.auth.repository.UserRepository;
import com.stockproject.experiment_service.auth.util.JwtUtil;
import com.stockproject.experiment_service.email.EmailService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName(), user.getLastName());
            System.out.println("Welcome email sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to " + user.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole().name());
    }
}
