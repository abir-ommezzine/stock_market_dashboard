package com.stockproject.experiment_service.service; // Changed to stockproject

import com.stockproject.experiment_service.model.Dataset;         // Corrected path
import com.stockproject.experiment_service.repository.DatasetRepository; // Corrected path
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

    public Dataset uploadDataset(MultipartFile file, Long userId) {
        // 1. Physically save the file to the disk/volume via FileStorageService
        String filePath = fileStorageService.storeFile(file, userId);
        
        // 2. Create the metadata record for the database
        Dataset dataset = new Dataset(userId, file.getOriginalFilename(), filePath);
        
        // 3. Save to PostgreSQL via DatasetRepository
        return datasetRepository.save(dataset);
    }

    public List<Dataset> getUserDatasets(Long userId) {
        return datasetRepository.findByUserId(userId);
    }
}