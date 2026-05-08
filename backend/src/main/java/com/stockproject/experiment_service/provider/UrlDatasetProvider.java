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
        
        System.out.println("=== URL PROVIDER DEBUG ===");
        System.out.println("Fetching from URL: " + url);

        String csv = restTemplate.getForObject(url, String.class);

        List<StockPrice> prices = new ArrayList<>();

        if (csv == null || csv.isBlank()) {
            System.out.println("ERROR: CSV is null or blank");
            return prices;
        }

        System.out.println("CSV received, length: " + csv.length());
        System.out.println("First 500 chars: " + csv.substring(0, Math.min(500, csv.length())));

        String[] lines = csv.split("\n");
        System.out.println("Total lines: " + lines.length);

        String headerLine = lines[0];
        String[] headers = headerLine.split(",");
        
        System.out.println("Headers: " + String.join(", ", headers));

        int dateIndex = -1;
        int openIndex = -1;
        int highIndex = -1;
        int lowIndex = -1;
        int closeIndex = -1;
        int volumeIndex = -1;

        for (int i = 0; i < headers.length; i++) {

            String h = headers[i].trim().toLowerCase();

            if (h.contains("date") || h.equals("timestamp")) dateIndex = i;
            else if (h.contains("open")) openIndex = i;
            else if (h.contains("high")) highIndex = i;
            else if (h.contains("low")) lowIndex = i;
            else if (h.contains("close")) closeIndex = i;
            else if (h.contains("volume")) volumeIndex = i;
        }
        
        System.out.println("Column indices - date:" + dateIndex + " open:" + openIndex + " high:" + highIndex + " low:" + lowIndex + " close:" + closeIndex + " volume:" + volumeIndex);

        // Try multiple date formats
        DateTimeFormatter[] formatters = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),  // Alpha Vantage format
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),  // US format
            DateTimeFormatter.ISO_LOCAL_DATE            // ISO format
        };

        int successCount = 0;
        int failCount = 0;

        for (int i = 1; i < lines.length; i++) {

            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            String[] cols = line.split(",");

            int maxIndex = Collections.max(
                    Arrays.asList(dateIndex, openIndex, highIndex, lowIndex, closeIndex, volumeIndex)
            );

            if (cols.length <= maxIndex) {
                System.out.println("Skipping line " + i + " - not enough columns: " + cols.length + " <= " + maxIndex);
                failCount++;
                continue;
            }

            try {

                StockPrice p = new StockPrice();

                // Try parsing date with multiple formats
                LocalDate date = null;
                String dateStr = cols[dateIndex].trim();
                for (DateTimeFormatter fmt : formatters) {
                    try {
                        date = LocalDate.parse(dateStr, fmt);
                        break;
                    } catch (Exception ignored) {}
                }
                
                if (date == null) {
                    System.out.println("Could not parse date on line " + i + ": " + dateStr);
                    failCount++;
                    continue;
                }

                p.setDate(date);
                p.setOpen(Double.parseDouble(cols[openIndex].trim()));
                p.setHigh(Double.parseDouble(cols[highIndex].trim()));
                p.setLow(Double.parseDouble(cols[lowIndex].trim()));
                p.setClose(Double.parseDouble(cols[closeIndex].trim()));
                p.setVolume(Double.parseDouble(cols[volumeIndex].trim()));

                prices.add(p);
                successCount++;

            } catch (Exception e) {
                System.out.println("Error parsing line " + i + ": " + line + " - Error: " + e.getMessage());
                failCount++;
            }
        }
        
        System.out.println("=== PARSING COMPLETE ===");
        System.out.println("Success: " + successCount + ", Failed: " + failCount);
        System.out.println("Returning " + prices.size() + " prices");

        return prices;
    }
}