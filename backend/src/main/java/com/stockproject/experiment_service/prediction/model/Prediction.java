package com.stockproject.experiment_service.prediction.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "predictions")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private Long datasetId;

    @Column(nullable = false)
    private String modelType;

    // JSON string: {"p":1,"d":1,"q":1,"steps":10}
    @Column(columnDefinition = "TEXT")
    private String parameters;

    // Full prediction result JSON from Python
    @Column(columnDefinition = "TEXT")
    private String resultJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
