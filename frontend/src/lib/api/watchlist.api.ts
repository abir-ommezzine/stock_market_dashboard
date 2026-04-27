import { apiFetch } from './api';

export interface WatchlistItem {
  id: number;
  userId: number;
  symbol: string;
  addedAt: string;
}

export interface AddToWatchlistRequest {
  userId: number;
  symbol: string;
}

export const watchlistApi = {
  // Add stock to watchlist
  addToWatchlist: async (request: AddToWatchlistRequest): Promise<WatchlistItem> => {
    const response = await apiFetch('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.json();
  },

  // Get user's watchlist
  getUserWatchlist: async (userId: number): Promise<WatchlistItem[]> => {
    const response = await apiFetch(`/api/watchlist/user/${userId}`);
    return response.json();
  },

  // Remove stock from watchlist
  removeFromWatchlist: async (userId: number, symbol: string): Promise<void> => {
    await apiFetch(`/api/watchlist/user/${userId}/symbol/${symbol}`, {
      method: 'DELETE',
    });
  },

  // Check if stock is in watchlist
  isInWatchlist: async (userId: number, symbol: string): Promise<boolean> => {
    const response = await apiFetch(`/api/watchlist/user/${userId}/symbol/${symbol}/exists`);
    const data = await response.json();
    return data.exists;
  }
};