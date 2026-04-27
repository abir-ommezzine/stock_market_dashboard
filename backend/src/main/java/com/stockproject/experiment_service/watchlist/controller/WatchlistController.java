package com.stockproject.experiment_service.watchlist.controller;

import com.stockproject.experiment_service.watchlist.dto.AddToWatchlistRequest;
import com.stockproject.experiment_service.watchlist.dto.WatchlistResponse;
import com.stockproject.experiment_service.watchlist.service.WatchlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @PostMapping
    public ResponseEntity<?> addToWatchlist(@RequestBody AddToWatchlistRequest request) {
        try {
            WatchlistResponse response = watchlistService.addToWatchlist(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WatchlistResponse>> getUserWatchlist(@PathVariable Long userId) {
        List<WatchlistResponse> watchlist = watchlistService.getUserWatchlist(userId);
        return ResponseEntity.ok(watchlist);
    }

    @DeleteMapping("/user/{userId}/symbol/{symbol}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable Long userId, @PathVariable String symbol) {
        watchlistService.removeFromWatchlist(userId, symbol);
        return ResponseEntity.ok(Map.of("message", "Stock removed from watchlist"));
    }

    @GetMapping("/user/{userId}/symbol/{symbol}/exists")
    public ResponseEntity<Map<String, Boolean>> isInWatchlist(@PathVariable Long userId, @PathVariable String symbol) {
        boolean exists = watchlistService.isInWatchlist(userId, symbol);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}