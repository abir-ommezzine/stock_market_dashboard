package com.stockproject.experiment_service.watchlist.repository;

import com.stockproject.experiment_service.watchlist.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUserIdOrderByAddedAtDesc(Long userId);
    Optional<Watchlist> findByUserIdAndSymbol(Long userId, String symbol);
    boolean existsByUserIdAndSymbol(Long userId, String symbol);
    void deleteByUserIdAndSymbol(Long userId, String symbol);
}