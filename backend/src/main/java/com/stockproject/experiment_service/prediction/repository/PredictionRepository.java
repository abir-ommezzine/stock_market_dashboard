package com.stockproject.experiment_service.prediction.repository;

import com.stockproject.experiment_service.prediction.model.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByCreatedAtBefore(LocalDateTime cutoff);
    long countByUserId(Long userId);
}
