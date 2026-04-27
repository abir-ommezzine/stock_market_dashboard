package com.stockproject.experiment_service.watchlist.service;

import com.stockproject.experiment_service.watchlist.dto.AddToWatchlistRequest;
import com.stockproject.experiment_service.watchlist.dto.WatchlistResponse;
import com.stockproject.experiment_service.watchlist.model.Watchlist;
import com.stockproject.experiment_service.watchlist.repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    public WatchlistService(WatchlistRepository watchlistRepository) {
        this.watchlistRepository = watchlistRepository;
    }

    public WatchlistResponse addToWatchlist(AddToWatchlistRequest request) {
        if (watchlistRepository.existsByUserIdAndSymbol(request.getUserId(), request.getSymbol())) {
            throw new IllegalArgumentException("Symbol already in watchlist");
        }

        Watchlist watchlist = Watchlist.builder()
                .userId(request.getUserId())
                .symbol(request.getSymbol().toUpperCase())
                .build();

        return new WatchlistResponse(watchlistRepository.save(watchlist));
    }

    public List<WatchlistResponse> getUserWatchlist(Long userId) {
        return watchlistRepository.findByUserIdOrderByAddedAtDesc(userId)
                .stream()
                .map(WatchlistResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeFromWatchlist(Long userId, String symbol) {
        watchlistRepository.deleteByUserIdAndSymbol(userId, symbol.toUpperCase());
    }

    public boolean isInWatchlist(Long userId, String symbol) {
        return watchlistRepository.existsByUserIdAndSymbol(userId, symbol.toUpperCase());
    }
}