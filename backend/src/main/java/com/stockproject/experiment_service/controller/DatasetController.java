package com.stockproject.experiment_service.controller;

import com.stockproject.experiment_service.model.Dataset;
import com.stockproject.experiment_service.service.DatasetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {

    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @Operation(summary = "Upload a dataset file")
    @PostMapping(
        value = "/upload", 
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Dataset> uploadDataset(
            @Parameter(
                description = "File to upload", 
                content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
            @RequestPart("file") MultipartFile file,
            @RequestParam("userId") Long userId) {

        return ResponseEntity.ok(
                datasetService.uploadDataset(file, userId)
        );
    }

    @Operation(summary = "Register an external API as a dataset")
    @PostMapping("/link-api")
    public ResponseEntity<Dataset> linkApiDataset(
            @RequestParam String apiUrl,
            @RequestParam String displayName,
            @RequestParam Long userId) {
        
        return ResponseEntity.ok(
                datasetService.registerApiDataset(apiUrl, displayName, userId)
        );
    }

    @Operation(summary = "Get all datasets for a specific user")
    @GetMapping("/{userId}")
    public ResponseEntity<List<Dataset>> getUserDatasets(@PathVariable Long userId) {
        return ResponseEntity.ok(datasetService.getUserDatasets(userId));
    }
}