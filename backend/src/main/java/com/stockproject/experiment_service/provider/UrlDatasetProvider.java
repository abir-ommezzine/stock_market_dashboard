package com.stockproject.experiment_service.provider;

import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;
import com.stockproject.experiment_service.provider.DataSourceProvider;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class UrlDatasetProvider implements DataSourceProvider {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public SourceType getType() {
        return SourceType.URL;
    }

    @Override
    public List<StockPrice> load(Map<String,Object> params){

        String url = String.valueOf(params.get("url"));

        String csv = restTemplate.getForObject(url,String.class);

        List<StockPrice> prices = new ArrayList<>();

        String[] lines = csv.split("\n");

        for(int i=1;i<lines.length;i++){
            if (lines[i].trim().isEmpty()) continue;
            String[] cols = lines[i].split(",");

            StockPrice p = new StockPrice();

            p.setDate(LocalDate.parse(cols[0]));
            p.setOpen(Double.valueOf(cols[1]));
            p.setHigh(Double.valueOf(cols[2]));
            p.setLow(Double.valueOf(cols[3]));
            p.setClose(Double.valueOf(cols[4]));
            p.setVolume(Double.valueOf(cols[5]));

            prices.add(p);
        }

        return prices;
    }
}