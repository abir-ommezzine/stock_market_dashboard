# Saves and loads trained models using joblib
# This avoids retraining the same model on repeated requests
# Cache key = hash of (symbol, model_type, p, d, q, data_length)

import joblib
import os
import hashlib
import json
from datetime import datetime

CACHE_DIR = "/tmp/model_cache"  # inside Docker container


def _make_cache_key(symbol: str, model_type: str, p: int, d: int, q: int, data_len: int) -> str:
    """Create a unique filename for this model configuration."""
    key_data = f"{symbol}_{model_type}_{p}_{d}_{q}_{data_len}"
    # Hash it so filenames stay short and filesystem-safe
    return hashlib.md5(key_data.encode()).hexdigest()


def save_model(model, symbol: str, model_type: str, p: int, d: int, q: int, data_len: int):
    """Save a fitted model to disk using joblib."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    key = _make_cache_key(symbol, model_type, p, d, q, data_len)
    path = os.path.join(CACHE_DIR, f"{key}.pkl")
    joblib.dump(model, path)
    print(f"[ModelCache] Saved model to {path}")
    return path


def load_model(symbol: str, model_type: str, p: int, d: int, q: int, data_len: int):
    """Load a previously saved model. Returns None if not found."""
    key = _make_cache_key(symbol, model_type, p, d, q, data_len)
    path = os.path.join(CACHE_DIR, f"{key}.pkl")
    if os.path.exists(path):
        print(f"[ModelCache] Loading cached model from {path}")
        return joblib.load(path)
    return None