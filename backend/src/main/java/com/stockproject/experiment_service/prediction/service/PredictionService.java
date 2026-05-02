package com.stockproject.experiment_service.prediction.service;

import com.stockproject.experiment_service.prediction.dto.PredictionResponse;
import com.stockproject.experiment_service.prediction.dto.SavePredictionRequest;
import com.stockproject.experiment_service.prediction.model.Prediction;
import com.stockproject.experiment_service.prediction.repository.PredictionRepository;
import com.stockproject.experiment_service.repository.DatasetRepository;
import com.stockproject.experiment_service.model.Dataset;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final DatasetRepository datasetRepository;

    public PredictionService(PredictionRepository predictionRepository, DatasetRepository datasetRepository) {
        this.predictionRepository = predictionRepository;
        this.datasetRepository = datasetRepository;
    }

    public PredictionResponse save(SavePredictionRequest req) {
        Dataset dataset = datasetRepository.findById(req.getDatasetId()).orElse(null);
        if (dataset != null && dataset.isTemporary()) {
            dataset.setTemporary(false);
            datasetRepository.save(dataset);
        }

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
