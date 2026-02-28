package com.stockproject.experiment_service.factory;
import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.provider.DataSourceProvider;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DataSourceFactory {

    private final Map<SourceType, DataSourceProvider> providers;

    public DataSourceFactory(List<DataSourceProvider> list){
        providers = list.stream()
                .collect(Collectors.toMap(
                        DataSourceProvider::getType,
                        p -> p
                ));
    }

    public DataSourceProvider get(SourceType type){
        return providers.get(type);
    }
}