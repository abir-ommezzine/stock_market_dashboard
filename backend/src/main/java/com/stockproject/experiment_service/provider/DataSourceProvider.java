package com.stockproject.experiment_service.provider;

import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;

import java.util.List;
import java.util.Map;

public interface DataSourceProvider {

    SourceType getType();

    List<StockPrice> load(Map<String, String> params);
}