package com.stockproject.experiment_service.service;

import com.stockproject.experiment_service.model.Dataset;
import com.stockproject.experiment_service.model.SourceType; // Ensure you import the Enum
import com.stockproject.experiment_service.model.StockPrice;
import com.stockproject.experiment_service.provider.DataSourceProvider;
import com.stockproject.experiment_service.repository.DatasetRepository;
import com.stockproject.experiment_service.factory.DataSourceFactory;
import com.stockproject.experiment_service.repository.StockPriceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
public class DatasetService {

    private final FileStorageService fileStorageService;
    private final DatasetRepository datasetRepository;
    private final DataSourceFactory factory;
    private final StockPriceRepository stockRepo;

    public DatasetService(FileStorageService fileStorageService,
                          DatasetRepository datasetRepository,
                          DataSourceFactory factory, StockPriceRepository stockRepo) {
        this.fileStorageService = fileStorageService;
        this.datasetRepository = datasetRepository;
        this.factory = factory;
        this.stockRepo = stockRepo;
    }

    /**
     * Logic for physical file uploads (SourceType.FILE)
     */
    public Dataset loadFromSource(
            SourceType type,
            Map<String,String> params){

        DataSourceProvider provider = factory.get(type);

        List<StockPrice> prices = provider.load(params);

        Dataset dataset = new Dataset();
        dataset.setFileName("Loaded dataset");
        dataset.setSourceType(type);

        Dataset savedDataset = datasetRepository.save(dataset);

        prices.forEach(p -> p.setDatasetId(savedDataset.getId()));

        stockRepo.saveAll(prices);

        return savedDataset;
    }
    public Dataset uploadDataset(MultipartFile file, Long userId) {
        // 1. Physically save the file
        String filePath = fileStorageService.storeFile(file, userId);

        // 2. Create the record (The constructor we updated in the Model)
        Dataset dataset = new Dataset(userId, file.getOriginalFilename(), filePath);
        dataset.setSourceType(SourceType.FILE);

        // 3. Save to DB
        return datasetRepository.save(dataset);
    }

    /**
     * Logic for linking existing APIs (SourceType.API)
     */
    public Dataset registerApiDataset(SourceType sourceType, String displayName, Long userId) {
        // 1. Create the record
        // We use the new constructor for API sources
        Dataset dataset = new Dataset();
        dataset.setUserId(userId);
        dataset.setFileName(displayName); // User provides a name for this API source
        dataset.setSourceType(sourceType);
        dataset.setSourceType(SourceType.URL);

        // 2. Save to DB (No file storage needed)
        return datasetRepository.save(dataset);
    }

    public List<Dataset> getUserDatasets(Long userId) {
        return datasetRepository.findByUserId(userId);
    }
    public List<String> extractSymbolsFromDataset(Dataset dataset) {
        List<StockPrice> prices = stockRepo.findByDatasetId(dataset.getId());

        return prices.stream()
                .map(StockPrice::getSymbol)
                .distinct()
                .sorted()
                .toList();
    }
}