package com.stockproject.experiment_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockRequest {

    private Long datasetId;
    private String symbol;
    private String startDate;
    private String endDate;

    // getters setters
}