package com.stockproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController // Added this so you can test if it works immediately
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    // A simple test endpoint to verify the Docker container is running
    @GetMapping("/api/status")
    public String getStatus() {
        return "Java Backend is running!";
    }
}