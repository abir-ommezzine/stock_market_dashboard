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

        DataSourceProvider provider =
                providerFactory.get(dataset.getSourceType());

        return provider.load(Map.of(
                "symbol", req.getSymbol(),
                "url", dataset.getApiUrl(),
                "path", dataset.getFilePath()
        ));
    }
}