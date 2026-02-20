package com.stockproject.experiment_service.service;

import com.stockproject.experiment_service.model.Dataset;
import com.stockproject.experiment_service.model.SourceType; // Ensure you import the Enum
import com.stockproject.experiment_service.repository.DatasetRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class DatasetService {

    private final FileStorageService fileStorageService;
    private final DatasetRepository datasetRepository;

    public DatasetService(FileStorageService fileStorageService,
                          DatasetRepository datasetRepository) {
        this.fileStorageService = fileStorageService;
        this.datasetRepository = datasetRepository;
    }

    /**
     * Logic for physical file uploads (SourceType.FILE)
     */
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
    public Dataset registerApiDataset(String apiUrl, String displayName, Long userId) {
        // 1. Create the record
        // We use the new constructor for API sources
        Dataset dataset = new Dataset();
        dataset.setUserId(userId);
        dataset.setFileName(displayName); // User provides a name for this API source
        dataset.setApiUrl(apiUrl);
        dataset.setSourceType(SourceType.API);
        
        // 2. Save to DB (No file storage needed)
        return datasetRepository.save(dataset);
    }

    public List<Dataset> getUserDatasets(Long userId) {
        return datasetRepository.findByUserId(userId);
    }
}