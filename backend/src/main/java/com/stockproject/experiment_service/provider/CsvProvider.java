package com.stockproject.experiment_service.provider;
import com.stockproject.experiment_service.model.SourceType;
import com.stockproject.experiment_service.model.StockPrice;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CsvProvider implements DataSourceProvider {

    @Override
    public SourceType getType() {
        return SourceType.FILE;
    }

    @Override
    public List<StockPrice> load(Map<String,Object> params){

        String filePath = String.valueOf(params.get("filePath"));

        List<StockPrice> prices = new ArrayList<>();

        try(BufferedReader br =
                    Files.newBufferedReader(Paths.get(filePath))){

            String line;
            br.readLine(); // skip header

            while((line = br.readLine()) != null){

                String[] cols = line.split(",");

                StockPrice p = new StockPrice();

                p.setDate(LocalDate.parse(cols[0]));
                p.setOpen(Double.valueOf(cols[1]));
                p.setHigh(Double.valueOf(cols[2]));
                p.setLow(Double.valueOf(cols[3]));
                p.setClose(Double.valueOf(cols[4]));
                p.setVolume(Double.valueOf(cols[5]));

                prices.add(p);
            }

        }catch(Exception e){
            throw new RuntimeException(e);
        }

        return prices;
    }
}