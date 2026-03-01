package com.stockproject.experiment_service.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;

// --- Added new Spring HTTP imports ---
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
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
    public List<StockPrice> load(Map<String,Object> params){

        Object symObj = params.get("symbol");
        if(symObj == null || symObj.toString().isEmpty()) {
            throw new IllegalArgumentException("Parameter 'symbol' is required");
        }
        String symbol = symObj.toString();

        String url =
                "https://query1.finance.yahoo.com/v8/finance/chart/"
                        + symbol + "?range=1y&interval=1d";

        // --- THE FIX: Add a User-Agent header to spoof a real browser ---
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        // Use exchange() instead of getForObject() to pass the headers
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        String responseBody = response.getBody();
        // ----------------------------------------------------------------

        List<StockPrice> prices = new ArrayList<>();

        try{

            JsonNode root = mapper.readTree(responseBody);

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
            throw new RuntimeException("Failed parsing Yahoo Data: " + e.getMessage(), e);
        }

        return prices;
    }
}