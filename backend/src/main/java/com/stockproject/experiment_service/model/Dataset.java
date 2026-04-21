package com.stockproject.experiment_service.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "datasets")
public class Dataset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId=0L;

    @Column(nullable = false)
    private String fileName; // Display name for the dataset

    @Column(nullable = true) // Nullable because API sources don't have a local path initially
    private String filePath;

    @Column(nullable = true) // Stores the URL for external API datasets
    private String apiUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SourceType sourceType;

    private LocalDateTime createdAt;

    public Dataset() {}

    // Constructor for File Uploads
    public Dataset(Long userId, String fileName, String filePath) {
        this.userId = userId;
        this.fileName = fileName;
        this.filePath = filePath;
        this.sourceType = SourceType.FILE;
        this.createdAt = LocalDateTime.now();
    }

    // Constructor for API Links
    public Dataset(Long userId, String fileName, String apiUrl, SourceType sourceType) {
        this.userId = userId;
        this.fileName = fileName;
        this.apiUrl = apiUrl;
        this.sourceType = SourceType.URL;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }

    public SourceType getSourceType() { return sourceType; }
    public void setSourceType(SourceType sourceType) { this.sourceType = sourceType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}