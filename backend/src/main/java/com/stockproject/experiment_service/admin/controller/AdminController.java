package com.stockproject.experiment_service.admin.controller;

import com.stockproject.experiment_service.admin.dto.AdminStatsResponse;
import com.stockproject.experiment_service.admin.dto.UserSummary;
import com.stockproject.experiment_service.auth.model.User;
import com.stockproject.experiment_service.auth.repository.UserRepository;
import com.stockproject.experiment_service.prediction.repository.PredictionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;

    public AdminController(UserRepository userRepository,
                           PredictionRepository predictionRepository) {
        this.userRepository = userRepository;
        this.predictionRepository = predictionRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalUsers = userRepository.count();
        long totalPredictions = predictionRepository.count();

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);

        // Count predictions grouped by modelType
        Map<String, Long> predictionsByModel = predictionRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        p -> p.getModelType(),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(new AdminStatsResponse(
                totalUsers, newUsersThisMonth, totalPredictions, predictionsByModel
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSummary>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserSummary> summaries = users.stream()
                .map(u -> new UserSummary(u,
                        predictionRepository.countByUserId(u.getId())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<UserSummary>> searchUsers(@RequestParam String q) {
        List<User> users = userRepository.searchByEmailOrName(q.toLowerCase());
        List<UserSummary> summaries = users.stream()
                .map(u -> new UserSummary(u,
                        predictionRepository.countByUserId(u.getId())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(summaries);
    }
}
