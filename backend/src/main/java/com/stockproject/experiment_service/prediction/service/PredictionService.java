package com.stockproject.experiment_service.prediction.service;

import com.stockproject.experiment_service.auth.model.User;
import com.stockproject.experiment_service.auth.repository.UserRepository;
import com.stockproject.experiment_service.prediction.dto.PredictionResponse;
import com.stockproject.experiment_service.prediction.dto.SavePredictionRequest;
import com.stockproject.experiment_service.prediction.model.Prediction;
import com.stockproject.experiment_service.prediction.repository.PredictionRepository;
import com.stockproject.experiment_service.repository.DatasetRepository;
import com.stockproject.experiment_service.model.Dataset;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final DatasetRepository datasetRepository;
    private final UserRepository userRepository;

    public PredictionService(PredictionRepository predictionRepository, 
                           DatasetRepository datasetRepository,
                           UserRepository userRepository) {
        this.predictionRepository = predictionRepository;
        this.datasetRepository = datasetRepository;
        this.userRepository = userRepository;
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
        List<Prediction> predictions = predictionRepository.findAll();
        
        // Get all unique user IDs
        List<Long> userIds = predictions.stream()
                .map(Prediction::getUserId)
                .distinct()
                .collect(Collectors.toList());
        
        // Fetch all users at once
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));
        
        // Map predictions with user information
        return predictions.stream()
                .map(p -> new PredictionResponse(p, userMap.get(p.getUserId())))
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
