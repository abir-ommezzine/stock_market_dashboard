package com.stockproject.experiment_service.provider;

import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;

@Service
public class CsvProvider implements DataSourceProvider {

    @Override
    public SourceType getType() {
        return SourceType.FILE;
    }

    @Override
    public List<StockPrice> load(Map<String, Object> params) {

        String filePath = String.valueOf(params.get("path"));
        List<StockPrice> prices = new ArrayList<>();

        try (BufferedReader br = Files.newBufferedReader(Paths.get(filePath))) {

            String headerLine = br.readLine();
            if (headerLine == null) return prices;

            String delimiter = headerLine.contains("\t") ? "\t" : ",";
            String[] headers = headerLine.split(delimiter);

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

            String line;

            while ((line = br.readLine()) != null) {

                if (line.isBlank()) continue;

                String[] cols = line.split(delimiter, -1);

                int maxIndex = Collections.max(
                        Arrays.asList(dateIndex, openIndex, highIndex, lowIndex, closeIndex, volumeIndex)
                );

                if (cols.length <= maxIndex) {
                    System.out.println("Skipping malformed row: " + line);
                    continue;
                }

                try {

                    StockPrice p = new StockPrice();

                    p.setDate(LocalDate.parse(cols[dateIndex].trim()));
                    p.setOpen(Double.parseDouble(cols[openIndex].trim()));
                    p.setHigh(Double.parseDouble(cols[highIndex].trim()));
                    p.setLow(Double.parseDouble(cols[lowIndex].trim()));
                    p.setClose(Double.parseDouble(cols[closeIndex].trim()));
                    p.setVolume(Double.parseDouble(cols[volumeIndex].trim()));

                    prices.add(p);

                } catch (Exception parseError) {

                    System.out.println("Skipping bad data row: " + line);
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("CSV loading failed: " + e.getMessage(), e);
        }

        return prices;
    }
}