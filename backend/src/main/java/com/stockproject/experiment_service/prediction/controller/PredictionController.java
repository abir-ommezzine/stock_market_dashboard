package com.stockproject.experiment_service.prediction.controller;

import com.stockproject.experiment_service.prediction.dto.PredictionResponse;
import com.stockproject.experiment_service.prediction.dto.SavePredictionRequest;
import com.stockproject.experiment_service.prediction.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping
    public ResponseEntity<PredictionResponse> save(@RequestBody SavePredictionRequest req) {
        return ResponseEntity.ok(predictionService.save(req));
    }

    @GetMapping
    public ResponseEntity<List<PredictionResponse>> getAll() {
        return ResponseEntity.ok(predictionService.getAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PredictionResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(predictionService.getByUser(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        predictionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
