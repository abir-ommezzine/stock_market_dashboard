package com.stockproject.experiment_service.controller;

import com.stockproject.experiment_service.dto.FetchDatasetRequest;
import com.stockproject.experiment_service.service.StockDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
public class StockDataController {

    private final StockDataService stockDataService;

    public StockDataController(StockDataService stockDataService) {
        this.stockDataService = stockDataService;
    }

    @PostMapping("/fetch")
    public ResponseEntity<?> fetchData(
            @RequestBody FetchDatasetRequest request) {

        Object data =
                stockDataService.fetchDatasetData(
                        request.getDatasetId(),
                        request.getSymbol(),
                        request.getStartDate(),
                        request.getEndDate());

        return ResponseEntity.ok(data);
    }
}