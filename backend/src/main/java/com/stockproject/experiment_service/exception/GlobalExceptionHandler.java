package com.stockproject.experiment_service.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<String> handleFileStorage(FileStorageException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}