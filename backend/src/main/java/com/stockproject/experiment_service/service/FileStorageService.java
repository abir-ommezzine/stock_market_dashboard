package com.stockproject.experiment_service.service; // Changed to stockproject

import com.stockproject.experiment_service.exception.FileStorageException; // Corrected path
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        // Ensure the path is created on startup
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new FileStorageException("Could not create upload directory", e);
        }
    }

    public String storeFile(MultipartFile file, Long userId) {

        if (file.isEmpty()) {
            throw new FileStorageException("File is empty");
        }

        String originalFileName = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename())
        );

        // Security check: only allow CSV
        if (!originalFileName.toLowerCase().endsWith(".csv")) {
            throw new FileStorageException("Only CSV files are allowed");
        }

        try {
            // Organize files by userId to avoid a massive single directory
            Path userFolder = uploadPath.resolve(String.valueOf(userId));
            Files.createDirectories(userFolder);

            // Prevent naming collisions with UUID
            String uniqueFileName = UUID.randomUUID() + "_" + originalFileName;
            Path targetLocation = userFolder.resolve(uniqueFileName);

            Files.copy(file.getInputStream(), targetLocation,
                    StandardCopyOption.REPLACE_EXISTING);

            return targetLocation.toString();

        } catch (IOException ex) {
            throw new FileStorageException("Could not store file", ex);
        }
    }
}