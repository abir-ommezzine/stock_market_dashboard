package com.stockproject.experiment_service.prediction.service;

import com.stockproject.experiment_service.prediction.repository.PredictionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PredictionCleanupService {

    private final PredictionRepository predictionRepository;

    public PredictionCleanupService(PredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void deleteOldPredictions() {
        LocalDateTime cutoff = LocalDateTime.now().minusMonths(3);
        predictionRepository.deleteByCreatedAtBefore(cutoff);
    }
}
