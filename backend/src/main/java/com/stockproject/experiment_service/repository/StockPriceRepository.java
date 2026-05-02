package com.stockproject.experiment_service.repository;

import com.stockproject.experiment_service.model.StockPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockPriceRepository
        extends JpaRepository<StockPrice,Long> {

    List<StockPrice> findByDatasetId(Long datasetId);
    
    void deleteByDatasetId(Long datasetId);
}
