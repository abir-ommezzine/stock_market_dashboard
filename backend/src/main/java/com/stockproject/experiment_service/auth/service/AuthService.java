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

import java.time.LocalDateTime;
import java.util.UUID;

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

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .emailVerificationToken(verificationToken)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationToken);
            System.out.println("Verification email sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send verification email to " + user.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send verification email");
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

        if (!user.isEmailVerified()) {
            throw new BadCredentialsException("Please verify your email address before logging in. Check your inbox for the verification link.");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole().name());
    }

    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User updateProfile(Long userId, String firstName, String lastName, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        
        return userRepository.save(user);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), resetToken);
            System.out.println("Password reset email sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send password reset email to " + user.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    public AuthResponse verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token"));

        if (user.isEmailVerified()) {
            // If already verified, just return the auth response to allow login
            String jwtToken = jwtUtil.generateToken(user.getEmail());
            return new AuthResponse(jwtToken, user.getId(), user.getEmail(),
                    user.getFirstName(), user.getLastName(), user.getRole().name());
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName(), user.getLastName());
            System.out.println("Welcome email sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to " + user.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
        }

        String jwtToken = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(jwtToken, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole().name());
    }
}
