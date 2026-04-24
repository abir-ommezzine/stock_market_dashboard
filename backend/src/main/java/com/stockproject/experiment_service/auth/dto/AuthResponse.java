package com.stockproject.experiment_service.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
}
