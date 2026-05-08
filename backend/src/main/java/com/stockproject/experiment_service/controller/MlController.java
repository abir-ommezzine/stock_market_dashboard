package com.stockproject.experiment_service.controller;

import com.stockproject.experiment_service.model.Dataset;
import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;
import com.stockproject.experiment_service.provider.DataSourceProvider;
import com.stockproject.experiment_service.provider.ProviderFactory;
import com.stockproject.experiment_service.repository.DatasetRepository;
import com.stockproject.experiment_service.repository.StockPriceRepository;
import com.stockproject.experiment_service.service.MlClientService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class MlController {

    private final MlClientService mlClientService;
    private final StockPriceRepository stockPriceRepository;

    // ADDED: we need these to support live API fetching
    private final DatasetRepository datasetRepository;
    private final ProviderFactory providerFactory;

    public MlController(
            MlClientService mlClientService,
            StockPriceRepository stockPriceRepository,
            DatasetRepository datasetRepository,      // ADDED
            ProviderFactory providerFactory           // ADDED
    ) {
        this.mlClientService = mlClientService;
        this.stockPriceRepository = stockPriceRepository;
        this.datasetRepository = datasetRepository;
        this.providerFactory = providerFactory;
    }

    @PostMapping("/train")
    public Object train(@RequestBody Map<String, Object> payload) {
        return mlClientService.trainModel(payload);
    }

    @PostMapping("/metrics")
    public Object metrics(@RequestBody Map<String, Object> payload) {
        return mlClientService.computeMetrics(payload);
    }

    @PostMapping("/train-from-dataset")
    public Object trainFromDataset(@RequestBody Map<String, Object> body) {

        Long datasetId = Long.valueOf(body.get("datasetId").toString());
        String modelType = body.get("model_type").toString();

        // Optional params with defaults
        int p     = body.containsKey("p")     ? Integer.parseInt(body.get("p").toString())     : 1;
        int d     = body.containsKey("d")     ? Integer.parseInt(body.get("d").toString())     : 1;
        int q     = body.containsKey("q")     ? Integer.parseInt(body.get("q").toString())     : 1;
        int steps = body.containsKey("steps") ? Integer.parseInt(body.get("steps").toString()) : 10;

        // Load the dataset record so we know its source type and symbol
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Dataset not found: " + datasetId));

        List<StockPrice> prices;

        // CHANGED: branch based on source type
        // FILE datasets have prices already stored in the DB
        // URL, YAHOO and ALPHAVANTAGE need to fetch live from the external API
        if (dataset.getSourceType() == SourceType.FILE) {

            // --- Existing flow: read prices from DB ---
            prices = stockPriceRepository.findByDatasetId(datasetId);

            if (prices.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No stock prices found for dataset " + datasetId +
                                ". Please re-upload the CSV file.");
            }

        } else {
            // --- New flow: fetch live prices from URL, Yahoo or Alpha Vantage ---

            // We need a symbol to fetch — it must be passed in the request body
            // e.g. { "datasetId": 7, "model_type": "ARIMA", "symbol": "AAPL" }
            if (!body.containsKey("symbol") || body.get("symbol").toString().isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A 'symbol' is required for API-based datasets (e.g. AAPL)");
            }

            String symbol = body.get("symbol").toString();

            // Get the right provider (URL, Yahoo or AlphaVantage) based on dataset type
            DataSourceProvider provider = providerFactory.get(dataset.getSourceType());

            // Build params map with API key if available
            Map<String, Object> params = new java.util.HashMap<>();
            params.put("symbol", symbol);
            params.put("url", dataset.getApiUrl() != null ? dataset.getApiUrl() : "");
            params.put("path", dataset.getFilePath() != null ? dataset.getFilePath() : "");
            
            // Add API key if provided
            if (dataset.getApiKey() != null && !dataset.getApiKey().isEmpty()) {
                params.put("apiKey", dataset.getApiKey());
            }

            // Fetch live prices
            prices = provider.load(params);

            if (prices.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No data returned from " + dataset.getSourceType() + " for symbol: " + symbol);
            }
        }

        // From here everything is the same regardless of source type
        // Map StockPrice objects to the {date, close} format Python expects
        var data = prices.stream()
                .filter(p2 -> p2.getClose() != null && p2.getDate() != null)
                .sorted((a, b) -> a.getDate().compareTo(b.getDate())) // chronological order
                .map(p2 -> Map.of(
                        "date",  p2.getDate().toString(),
                        "close", p2.getClose()
                ))
                .toList();

        // Build the full payload for Python
        Map<String, Object> payload = Map.of(
                "data",       data,
                "model_type", modelType,
                "p",          p,
                "d",          d,
                "q",          q,
                "steps",      steps
        );

        // Send to Python FastAPI and return the predictions
        return mlClientService.trainModel(payload);
    }
}