package com.stockproject.experiment_service.repository; // Changed to stockproject

import com.stockproject.experiment_service.model.Dataset; // Corrected import
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DatasetRepository extends JpaRepository<Dataset, Long> {
    
    // Finds all datasets belonging to a specific user
    List<Dataset> findByUserId(Long userId);
    
    // Finds a specific dataset by name for a user
    List<Dataset> findByUserIdAndFileName(Long userId, String fileName);
}