package com.stockproject.experiment_service.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long newUsersThisMonth;
    private long totalPredictions;
    private Map<String, Long> predictionsByModel;
}
