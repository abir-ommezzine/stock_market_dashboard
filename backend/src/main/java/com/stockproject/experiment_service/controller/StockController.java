package com.stockproject.experiment_service.controller;

import com.stockproject.experiment_service.dto.StockRequest;
import com.stockproject.experiment_service.model.*;
import com.stockproject.experiment_service.provider.*;
import com.stockproject.experiment_service.repository.DatasetRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class StockController {

    private final DatasetRepository datasetRepository;
    private final ProviderFactory providerFactory;

    public StockController(
            DatasetRepository datasetRepository,
            ProviderFactory providerFactory
    ) {
        this.datasetRepository = datasetRepository;
        this.providerFactory = providerFactory;
    }

    @PostMapping("/fetch")
    public List<StockPrice> fetch(@RequestBody StockRequest req){

        Dataset dataset =
                datasetRepository.findById(req.getDatasetId())
                        .orElseThrow();
        if (dataset.getSourceType() == null) {
            throw new RuntimeException("Dataset sourceType is null for dataset " + dataset.getId());
        }
        DataSourceProvider provider =
                providerFactory.get(dataset.getSourceType());
        Map<String, Object> params = new java.util.HashMap<>();

        params.put("symbol", req.getSymbol());
        params.put("url", dataset.getApiUrl());
        params.put("path", dataset.getFilePath());
        
        // Pass API key if available
        if (dataset.getApiKey() != null && !dataset.getApiKey().isEmpty()) {
            params.put("apiKey", dataset.getApiKey());
        }
        
        System.out.println("REQ SYMBOL = " + req.getSymbol());
        System.out.println("DATASET API URL = " + dataset.getApiUrl());
        System.out.println("DATASET FILE PATH = " + dataset.getFilePath());
        System.out.println("DATASET SOURCE TYPE = " + dataset.getSourceType());
        System.out.println("DATASET API KEY = " + (dataset.getApiKey() != null ? "***PROVIDED***" : "NOT PROVIDED"));
        try {
            System.out.println("PARAMS: " + params);
            return provider.load(params);
        } catch (Exception e) {
            e.printStackTrace();  // <- this will show the real exception in console/logs
            throw new RuntimeException("Failed fetching stock data: " + e.getMessage());
        }
    }
}