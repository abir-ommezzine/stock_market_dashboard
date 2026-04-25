package com.stockproject.experiment_service.prediction.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SavePredictionRequest {
    private Long userId;
    private String company;
    private Long datasetId;
    private String modelType;
    private String parameters;  // JSON string
    private String resultJson;  // full prediction result JSON
}
