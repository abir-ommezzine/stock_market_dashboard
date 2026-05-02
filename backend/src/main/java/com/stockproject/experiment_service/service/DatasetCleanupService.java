package com.stockproject.experiment_service.service;

import com.stockproject.experiment_service.model.Dataset;
import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.repository.DatasetRepository;
import com.stockproject.experiment_service.repository.StockPriceRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DatasetCleanupService {

    private final DatasetRepository datasetRepository;
    private final StockPriceRepository stockPriceRepository;

    public DatasetCleanupService(DatasetRepository datasetRepository, StockPriceRepository stockPriceRepository) {
        this.datasetRepository = datasetRepository;
        this.stockPriceRepository = stockPriceRepository;
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupTemporaryDatasets() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(2);
        List<Dataset> temporaryDatasets = datasetRepository.findByTemporaryTrueAndCreatedAtBefore(cutoffTime);

        for (Dataset dataset : temporaryDatasets) {
            try {
                stockPriceRepository.deleteByDatasetId(dataset.getId());

                if (dataset.getSourceType() == SourceType.FILE && dataset.getFilePath() != null) {
                    File file = new File(dataset.getFilePath());
                    if (file.exists()) {
                        file.delete();
                    }
                }

                datasetRepository.delete(dataset);
                System.out.println("Deleted temporary dataset: " + dataset.getId() + " - " + dataset.getFileName());
            } catch (Exception e) {
                System.err.println("Failed to delete temporary dataset " + dataset.getId() + ": " + e.getMessage());
            }
        }

        if (!temporaryDatasets.isEmpty()) {
            System.out.println("Cleaned up " + temporaryDatasets.size() + " temporary datasets");
        }
    }
}
