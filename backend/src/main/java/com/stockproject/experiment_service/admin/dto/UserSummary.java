package com.stockproject.experiment_service.admin.dto;

import com.stockproject.experiment_service.auth.model.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserSummary {
    private final Long id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String role;
    private final LocalDateTime createdAt;
    private final long predictionCount;

    public UserSummary(User user, long predictionCount) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.role = user.getRole().name();
        this.createdAt = user.getCreatedAt();
        this.predictionCount = predictionCount;
    }
}
