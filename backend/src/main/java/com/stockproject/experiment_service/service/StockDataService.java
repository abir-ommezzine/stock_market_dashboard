package com.stockproject.experiment_service.service;

import com.stockproject.experiment_service.model.Dataset;
import com.stockproject.experiment_service.repository.DatasetRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class StockDataService {

    private final DatasetRepository datasetRepository;
    private final WebClient fastApiClient;

    public StockDataService(DatasetRepository datasetRepository,
                            WebClient fastApiClient) {
        this.datasetRepository = datasetRepository;
        this.fastApiClient = fastApiClient;
    }

    public Object fetchDatasetData(Long datasetId,
                                   String symbol,
                                   String start,
                                   String end) {

        Dataset dataset = datasetRepository
                .findById(datasetId)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));

        return fastApiClient.post()
                .uri("/dataset/load")
                .bodyValue(new FetchPayload(dataset, symbol, start, end))
                .retrieve()
                .bodyToMono(Object.class)
                .block();
    }

    private static class FetchPayload {

        public Long id;
        public String source;
        public String filePath;
        public String apiUrl;
        public String symbol;
        public String start;
        public String end;

        public FetchPayload(Dataset dataset,
                            String symbol,
                            String start,
                            String end) {

            this.source = dataset.getSourceName();
            this.filePath = dataset.getFilePath();
            this.apiUrl = dataset.getApiUrl();
            this.symbol = symbol;
            this.start = start;
            this.end = end;
        }
    }
}