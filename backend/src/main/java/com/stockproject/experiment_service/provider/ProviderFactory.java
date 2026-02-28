package com.stockproject.experiment_service.provider;

import com.stockproject.experiment_service.model.SourceType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProviderFactory {

    private final Map<SourceType, DataSourceProvider> providers;

    public ProviderFactory(List<DataSourceProvider> providerList) {
        this.providers = providerList.stream()
                .collect(Collectors.toMap(
                        DataSourceProvider::getType,
                        p -> p
                ));
    }

    public DataSourceProvider get(SourceType type) {
        DataSourceProvider provider = providers.get(type);

        if (provider == null) {
            throw new RuntimeException("No provider found for type: " + type);
        }

        return provider;
    }
}