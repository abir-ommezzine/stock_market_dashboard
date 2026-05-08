package com.stockproject.experiment_service.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Service
public class AlphaVantageProvider implements DataSourceProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // TODO: PASTE YOUR REAL ALPHA VANTAGE API KEY HERE!
    private final String API_KEY = "6S5VD3ABKB9CWNZC";

    @Override
    public SourceType getType() {
        return SourceType.ALPHAVANTAGE;
    }

    @Override
    public List<StockPrice> load(Map<String, Object> params) {
        Object symObj = params.get("symbol");
        if (symObj == null || symObj.toString().isEmpty()) {
            throw new IllegalArgumentException("Parameter 'symbol' is required");
        }
        String symbol = symObj.toString();

        // Get API key from params (passed from dataset) or use default
        String apiKey = API_KEY; // Default key
        if (params.containsKey("apiKey") && params.get("apiKey") != null) {
            String customKey = params.get("apiKey").toString();
            if (!customKey.isEmpty()) {
                apiKey = customKey;
            }
        }

        String url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="
                + symbol + "&apikey=" + apiKey;

        String response = restTemplate.getForObject(url, String.class);
        List<StockPrice> prices = new ArrayList<>();

        try {
            JsonNode root = mapper.readTree(response);

            // --- THE FIX: Explicitly check for Alpha Vantage's specific error nodes ---
            if (root.has("Error Message")) {
                throw new RuntimeException("Alpha Vantage Error: Invalid API call or symbol (" + symbol + ").");
            }
            if (root.has("Information")) {
                // This usually triggers when you hit the 25 requests/day limit
                throw new RuntimeException("Alpha Vantage API Limit: " + root.get("Information").asText());
            }

            JsonNode timeSeries = root.path("Time Series (Daily)");

            // Fallback check just in case the structure changes
            if (timeSeries.isMissingNode()) {
                throw new RuntimeException("Could not find Time Series data in Alpha Vantage response.");
            }
            // -------------------------------------------------------------------------

            Iterator<Map.Entry<String, JsonNode>> fields = timeSeries.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                LocalDate date = LocalDate.parse(entry.getKey());
                JsonNode dailyData = entry.getValue();

                StockPrice p = new StockPrice();
                p.setSymbol(symbol);
                p.setDate(date);
                p.setOpen(dailyData.path("1. open").asDouble());
                p.setHigh(dailyData.path("2. high").asDouble());
                p.setLow(dailyData.path("3. low").asDouble());
                p.setClose(dailyData.path("4. close").asDouble());
                p.setVolume(dailyData.path("5. volume").asDouble());

                prices.add(p);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch Alpha Vantage data: " + e.getMessage(), e);
        }

        return prices;
    }
}