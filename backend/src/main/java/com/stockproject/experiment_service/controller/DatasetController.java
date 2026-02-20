package com.stockproject.experiment_service.controller;

import com.stockproject.experiment_service.model.Dataset;
import com.stockproject.experiment_service.service.DatasetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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

    @GetMapping("/{userId}")
    public ResponseEntity<List<Dataset>> getUserDatasets(@PathVariable Long userId) {
        return ResponseEntity.ok(datasetService.getUserDatasets(userId));
    }
}