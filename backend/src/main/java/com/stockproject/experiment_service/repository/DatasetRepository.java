package com.stockproject.experiment_service.repository;

import com.stockproject.experiment_service.model.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface DatasetRepository extends JpaRepository<Dataset, Long> {

    List<Dataset> findByUserId(Long userId);

    List<Dataset> findByUserIdAndFileName(Long userId, String fileName);

    List<Dataset> findByTemporaryTrueAndCreatedAtBefore(LocalDateTime cutoffTime);
}