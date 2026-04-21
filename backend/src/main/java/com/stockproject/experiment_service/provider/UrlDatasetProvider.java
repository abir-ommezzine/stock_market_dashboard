package com.stockproject.experiment_service.provider;

import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class UrlDatasetProvider implements DataSourceProvider {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public SourceType getType() {
        return SourceType.URL;
    }

    @Override
    public List<StockPrice> load(Map<String, Object> params) {

        String url = String.valueOf(params.get("url"));

        String csv = restTemplate.getForObject(url, String.class);

        List<StockPrice> prices = new ArrayList<>();

        if (csv == null || csv.isBlank()) return prices;

        String[] lines = csv.split("\n");

        String headerLine = lines[0];
        String[] headers = headerLine.split(",");

        int dateIndex = -1;
        int openIndex = -1;
        int highIndex = -1;
        int lowIndex = -1;
        int closeIndex = -1;
        int volumeIndex = -1;

        for (int i = 0; i < headers.length; i++) {

            String h = headers[i].trim().toLowerCase();

            if (h.contains("date")) dateIndex = i;
            else if (h.contains("open")) openIndex = i;
            else if (h.contains("high")) highIndex = i;
            else if (h.contains("low")) lowIndex = i;
            else if (h.contains("close")) closeIndex = i;
            else if (h.contains("volume")) volumeIndex = i;
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");

        for (int i = 1; i < lines.length; i++) {

            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            String[] cols = line.split(",");

            int maxIndex = Collections.max(
                    Arrays.asList(dateIndex, openIndex, highIndex, lowIndex, closeIndex, volumeIndex)
            );

            if (cols.length <= maxIndex) continue;

            try {

                StockPrice p = new StockPrice();

                p.setDate(LocalDate.parse(cols[dateIndex].trim(), formatter));
                p.setOpen(Double.parseDouble(cols[openIndex].trim()));
                p.setHigh(Double.parseDouble(cols[highIndex].trim()));
                p.setLow(Double.parseDouble(cols[lowIndex].trim()));
                p.setClose(Double.parseDouble(cols[closeIndex].trim()));
                p.setVolume(Double.parseDouble(cols[volumeIndex].trim()));

                prices.add(p);

            } catch (Exception e) {
                System.out.println("Skipping bad row: " + line);
            }
        }

        return prices;
    }
}