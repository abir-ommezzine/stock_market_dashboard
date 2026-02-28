package com.stockproject.experiment_service.controller;

import com.stockproject.experiment_service.dto.StockRequest;
import com.stockproject.experiment_service.model.Dataset;
import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;
import com.stockproject.experiment_service.provider.DataSourceProvider;
import com.stockproject.experiment_service.service.DatasetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.stockproject.experiment_service.repository.DatasetRepository;
import com.stockproject.experiment_service.repository.StockPriceRepository;
import com.stockproject.experiment_service.provider.ProviderFactory;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {

    private final DatasetService datasetService;
    private final DatasetRepository datasetRepository;
    private final StockPriceRepository stockPriceRepository;
    private final ProviderFactory providerFactory;

    public DatasetController(
            DatasetService datasetService,
            DatasetRepository datasetRepository,
            StockPriceRepository stockPriceRepository,
            ProviderFactory providerFactory
    ) {
        this.datasetService = datasetService;
        this.datasetRepository = datasetRepository;
        this.stockPriceRepository = stockPriceRepository;
        this.providerFactory = providerFactory;
    }

    @Operation(summary = "Upload a dataset file")
    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Dataset> uploadDataset(
            @Parameter(
                    description = "File to upload",
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) Long userId) {
        Long uid = (userId == null) ? 0L : userId;
        return ResponseEntity.ok(
                datasetService.uploadDataset(file, uid)
        );
    }

    @Operation(summary = "Register an external API as a dataset")
    @PostMapping("/link-source")
    public ResponseEntity<Dataset> linkSource(
            @RequestParam SourceType sourceName,
            @RequestParam String displayName,
            @RequestParam(required = false) Long userId) {
        Long uid = (userId == null) ? 0L : userId;
        return ResponseEntity.ok(
                datasetService.registerApiDataset(sourceName, displayName, uid)
        );
    }

    @Operation(summary = "Get all datasets for a specific user")
    @GetMapping("/{userId}")
    public ResponseEntity<List<Dataset>> getUserDatasets(@PathVariable Long userId) {
        return ResponseEntity.ok(datasetService.getUserDatasets(userId));
    }

    @PostMapping("/load")
    public ResponseEntity<?> loadDataset(
            @RequestParam SourceType sourceType,
            @RequestParam Map<String,String> params
    ){
        return ResponseEntity.ok(
                datasetService.loadFromSource(sourceType, params)
        );
    }
    @GetMapping("/{datasetId}/prices")
    public ResponseEntity<?> getPrices(
            @PathVariable Long datasetId){

        return ResponseEntity.ok(
                stockPriceRepository.findByDatasetId(datasetId)
        );
    }
    @PostMapping("/stocks/fetch")
    public List<StockPrice> fetch(@RequestBody StockRequest req){

        Dataset dataset =
                datasetRepository.findById(req.getDatasetId()).orElseThrow();

        DataSourceProvider provider =
                providerFactory.get(dataset.getSourceType());

        return provider.load(Map.of(
                "symbol", req.getSymbol(),
                "url", dataset.getApiUrl(),
                "path", dataset.getFilePath()
        ));
    }
    @GetMapping("/sources")
    public ResponseEntity<List<Map<String,String>>> getSources() {

        List<Map<String,String>> sources = List.of(
                Map.of("value", "YAHOO", "label", "Yahoo Finance"),
                Map.of("value", "ALPHAVANTAGE", "label", "Alpha Vantage")
        );

        return ResponseEntity.ok(sources);
    }
    @GetMapping("/{datasetId}/symbols")
    public ResponseEntity<List<String>> getSymbols(@PathVariable Long datasetId) {

        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));

        List<String> symbols;

        switch (dataset.getSourceType()) {
            case FILE:
            case URL:
                // Extract distinct symbols from the dataset
                symbols = datasetService.extractSymbolsFromDataset(dataset);
                break;

            case YAHOO:
            case ALPHAVANTAGE:
                // Predefined popular symbols for API sources
                symbols = List.of("AAPL", "GOOGL", "MSFT", "AMZN", "TSLA");
                break;

            default:
                symbols = List.of(); // empty list for unknown types
        }

        return ResponseEntity.ok(symbols);
    }
}