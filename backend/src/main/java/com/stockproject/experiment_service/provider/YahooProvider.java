package com.stockproject.experiment_service.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;
import com.stockproject.experiment_service.provider.DataSourceProvider;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class YahooProvider implements DataSourceProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public SourceType getType() {
        return SourceType.YAHOO;
    }

    @Override
    public List<StockPrice> load(Map<String,String> params){

        String symbol = params.get("symbol");

        String url =
                "https://query1.finance.yahoo.com/v8/finance/chart/"
                        + symbol + "?range=1y&interval=1d";

        String response =
                restTemplate.getForObject(url,String.class);

        List<StockPrice> prices = new ArrayList<>();

        try{

            JsonNode root = mapper.readTree(response);

            JsonNode result =
                    root.path("chart")
                            .path("result").get(0);

            JsonNode timestamps =
                    result.path("timestamp");

            JsonNode quote =
                    result.path("indicators")
                            .path("quote").get(0);

            for(int i=0;i<timestamps.size();i++){

                StockPrice p = new StockPrice();

                long epoch = timestamps.get(i).asLong();

                p.setSymbol(symbol);
                p.setDate(
                        Instant.ofEpochSecond(epoch)
                                .atZone(ZoneId.systemDefault())
                                .toLocalDate()
                );

                p.setOpen(quote.path("open").get(i).asDouble());
                p.setHigh(quote.path("high").get(i).asDouble());
                p.setLow(quote.path("low").get(i).asDouble());
                p.setClose(quote.path("close").get(i).asDouble());
                p.setVolume(quote.path("volume").get(i).asDouble());

                prices.add(p);
            }

        }catch(Exception e){
            throw new RuntimeException(e);
        }

        return prices;
    }
}