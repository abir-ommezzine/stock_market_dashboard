package com.stockproject.experiment_service.prediction.dto;

import com.stockproject.experiment_service.auth.model.User;
import com.stockproject.experiment_service.prediction.model.Prediction;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class PredictionResponse {
    private final Long id;
    private final Long userId;
    private final String userEmail;
    private final String userFirstName;
    private final String userLastName;
    private final String company;
    private final Long datasetId;
    private final String modelType;
    private final String parameters;
    private final String resultJson;
    private final LocalDateTime createdAt;

    public PredictionResponse(Prediction p) {
        this.id = p.getId();
        this.userId = p.getUserId();
        this.userEmail = null;
        this.userFirstName = null;
        this.userLastName = null;
        this.company = p.getCompany();
        this.datasetId = p.getDatasetId();
        this.modelType = p.getModelType();
        this.parameters = p.getParameters();
        this.resultJson = p.getResultJson();
        this.createdAt = p.getCreatedAt();
    }

    public PredictionResponse(Prediction p, User user) {
        this.id = p.getId();
        this.userId = p.getUserId();
        this.userEmail = user != null ? user.getEmail() : "unknown@example.com";
        this.userFirstName = user != null ? user.getFirstName() : "Unknown";
        this.userLastName = user != null ? user.getLastName() : "User";
        this.company = p.getCompany();
        this.datasetId = p.getDatasetId();
        this.modelType = p.getModelType();
        this.parameters = p.getParameters();
        this.resultJson = p.getResultJson();
        this.createdAt = p.getCreatedAt();
    }
}
