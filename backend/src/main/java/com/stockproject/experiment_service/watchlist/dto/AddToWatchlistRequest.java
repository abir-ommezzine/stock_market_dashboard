package com.stockproject.experiment_service.watchlist.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddToWatchlistRequest {
    private Long userId;
    private String symbol;
}