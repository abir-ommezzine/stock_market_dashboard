package com.stockproject.experiment_service.prediction.service;

import com.stockproject.experiment_service.prediction.dto.PredictionResponse;
import com.stockproject.experiment_service.prediction.dto.SavePredictionRequest;
import com.stockproject.experiment_service.prediction.model.Prediction;
import com.stockproject.experiment_service.prediction.repository.PredictionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;

    public PredictionService(PredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    public PredictionResponse save(SavePredictionRequest req) {
        Prediction prediction = Prediction.builder()
                .userId(req.getUserId())
                .company(req.getCompany())
                .datasetId(req.getDatasetId())
                .modelType(req.getModelType())
                .parameters(req.getParameters())
                .resultJson(req.getResultJson())
                .build();
        return new PredictionResponse(predictionRepository.save(prediction));
    }

    public List<PredictionResponse> getAll() {
        return predictionRepository.findAll()
                .stream()
                .map(PredictionResponse::new)
                .collect(Collectors.toList());
    }

    public List<PredictionResponse> getByUser(Long userId) {
        return predictionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(PredictionResponse::new)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        predictionRepository.deleteById(id);
    }
}
