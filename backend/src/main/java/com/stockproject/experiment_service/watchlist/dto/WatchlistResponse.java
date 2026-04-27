package com.stockproject.experiment_service.watchlist.dto;

import com.stockproject.experiment_service.watchlist.model.Watchlist;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class WatchlistResponse {
    private final Long id;
    private final Long userId;
    private final String symbol;
    private final LocalDateTime addedAt;

    public WatchlistResponse(Watchlist watchlist) {
        this.id = watchlist.getId();
        this.userId = watchlist.getUserId();
        this.symbol = watchlist.getSymbol();
        this.addedAt = watchlist.getAddedAt();
    }
}