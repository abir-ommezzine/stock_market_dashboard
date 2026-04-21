package com.stockproject.experiment_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MlClientService {

    private final RestTemplate restTemplate = new RestTemplate();

    // VERY IMPORTANT → use docker service name
    private final String ML_URL = "http://python-api:8000";

    public Object trainModel(Object payload) {
        return restTemplate.postForObject(
                ML_URL + "/train",
                payload,
                Object.class
        );
    }

    public Object computeMetrics(Object payload) {
        return restTemplate.postForObject(
                ML_URL + "/metrics",
                payload,
                Object.class
        );
    }
}