package com.stockproject.experiment_service.prediction.service;

import com.stockproject.experiment_service.model.Dataset;
import com.stockproject.experiment_service.prediction.dto.PredictionResponse;
import com.stockproject.experiment_service.prediction.dto.SavePredictionRequest;
import com.stockproject.experiment_service.prediction.model.Prediction;
import com.stockproject.experiment_service.prediction.repository.PredictionRepository;
import com.stockproject.experiment_service.repository.DatasetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PredictionServiceTest {

    @Mock private PredictionRepository predictionRepository;
    @Mock private DatasetRepository datasetRepository;

    @InjectMocks private PredictionService predictionService;

    private SavePredictionRequest saveRequest;
    private Prediction savedPrediction;

    @BeforeEach
    void setUp() {
        saveRequest = new SavePredictionRequest();
        saveRequest.setUserId(1L);
        saveRequest.setCompany("AAPL");
        saveRequest.setDatasetId(10L);
        saveRequest.setModelType("ARIMA");
        saveRequest.setParameters("{\"p\":1,\"d\":1,\"q\":1,\"steps\":10}");
        saveRequest.setResultJson("{\"predictions\":[]}");

        savedPrediction = Prediction.builder()
                .id(1L)
                .userId(1L)
                .company("AAPL")
                .datasetId(10L)
                .modelType("ARIMA")
                .parameters("{\"p\":1,\"d\":1,\"q\":1,\"steps\":10}")
                .resultJson("{\"predictions\":[]}")
                .build();
    }

    // ── SAVE ──────────────────────────────────────────────────────────────────

    @Test
    void save_shouldPersistPrediction_andReturnResponse() {
        when(datasetRepository.findById(10L)).thenReturn(Optional.empty());
        when(predictionRepository.save(any(Prediction.class))).thenReturn(savedPrediction);

        PredictionResponse response = predictionService.save(saveRequest);

        assertThat(response).isNotNull();
        assertThat(response.getCompany()).isEqualTo("AAPL");
        assertThat(response.getModelType()).isEqualTo("ARIMA");
        verify(predictionRepository).save(any(Prediction.class));
    }

    @Test
    void save_shouldMarkDatasetAsPermanent_whenDatasetIsTemporary() {
        Dataset tempDataset = new Dataset();
        tempDataset.setTemporary(true);

        when(datasetRepository.findById(10L)).thenReturn(Optional.of(tempDataset));
        when(datasetRepository.save(any(Dataset.class))).thenReturn(tempDataset);
        when(predictionRepository.save(any(Prediction.class))).thenReturn(savedPrediction);

        predictionService.save(saveRequest);

        assertThat(tempDataset.isTemporary()).isFalse();
        verify(datasetRepository).save(tempDataset);
    }

    // ── GET BY USER ───────────────────────────────────────────────────────────

    @Test
    void getByUser_shouldReturnUserPredictions() {
        when(predictionRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(savedPrediction));

        List<PredictionResponse> results = predictionService.getByUser(1L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCompany()).isEqualTo("AAPL");
    }

    @Test
    void getByUser_shouldReturnEmptyList_whenNoPredictions() {
        when(predictionRepository.findByUserIdOrderByCreatedAtDesc(99L))
                .thenReturn(List.of());

        List<PredictionResponse> results = predictionService.getByUser(99L);

        assertThat(results).isEmpty();
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Test
    void delete_shouldCallRepository() {
        doNothing().when(predictionRepository).deleteById(1L);

        predictionService.delete(1L);

        verify(predictionRepository).deleteById(1L);
    }
}
