package com.stockproject.experiment_service.model; // Changed from predstock to stockproject

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "datasets")
public class Dataset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private LocalDateTime uploadedAt;

    public Dataset() {}

    public Dataset(Long userId, String fileName, String filePath) {
        this.userId = userId;
        this.fileName = fileName;
        this.filePath = filePath;
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters and Setters remain the same...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    @PrePersist
    protected void onCreate() {
        if (this.uploadedAt == null) {
            this.uploadedAt = LocalDateTime.now();
        }
    }
}