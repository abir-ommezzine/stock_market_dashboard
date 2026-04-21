# Handles all data cleaning and transformation before model fitting
# Returns cleaned series + metadata about what transforms were applied
# (we need to know transforms to invert them when reconstructing prices)

import numpy as np
import pandas as pd
from typing import Tuple


def preprocess(data: list, use_log: bool = False, use_pct_change: bool = False) -> Tuple[pd.Series, dict]:
    """
    Clean and optionally transform the close price series.

    Returns:
        series: cleaned pd.Series ready for modeling
        meta:   dict describing what was done (needed to invert transforms later)
    """
    meta = {
        "used_log": False,
        "used_pct_change": False,
        "original_first_value": None,  # needed to reconstruct prices from % changes
    }

    # 1. Extract close prices into a pandas Series
    series = pd.Series(
        [float(p.close) for p in data],
        index=pd.to_datetime([p.date for p in data])
    )

    # 2. Remove NaN rows — these would crash the model
    # dropna() removes any row where the value is NaN
    original_len = len(series)
    series = series.dropna()
    dropped = original_len - len(series)
    if dropped > 0:
        print(f"[Preprocessing] Dropped {dropped} NaN rows")

    # 3. Optional: log transform — stabilizes variance in exponentially growing series
    # Example: AAPL went from $1 to $200, log makes the scale uniform
    if use_log:
        if (series <= 0).any():
            print("[Preprocessing] Cannot apply log: series contains non-positive values")
        else:
            series = np.log(series)
            meta["used_log"] = True
            print("[Preprocessing] Applied log transform")

    # 4. Optional: percentage change — models the returns instead of raw prices
    # % change = (today - yesterday) / yesterday * 100
    # This naturally removes trend and makes most series stationary
    if use_pct_change:
        meta["original_first_value"] = float(series.iloc[0])
        series = series.pct_change().dropna()  # first row becomes NaN after pct_change
        meta["used_pct_change"] = True
        print("[Preprocessing] Applied percentage change transform")

    return series, meta


def invert_transforms(predictions: list, meta: dict, last_actual: float) -> list:
    """
    Reverse any transforms applied during preprocessing so predictions
    are back in original price units (dollars).

    Called after model.forecast() to convert predictions back.
    """
    preds = np.array(predictions)

    # Invert percentage change: reconstruct prices using cumulative sum
    # If we modeled % changes, we need to convert back to actual prices
    # Formula: price[t] = price[t-1] * (1 + pct_change[t])
    if meta.get("used_pct_change"):
        # cumsum gives us cumulative % changes, then we scale from last actual price
        preds = last_actual * np.exp(np.cumsum(preds))

    # Invert log transform: exp() reverses log()
    if meta.get("used_log"):
        preds = np.exp(preds)

    return preds.tolist()


def detrend(series: pd.Series, window: int = 20) -> Tuple[pd.Series, pd.Series]:
    """
    Remove trend by subtracting rolling mean.
    Formula: detrended = series - series.rolling(window).mean()

    Returns detrended series and the rolling mean (needed to add trend back later).
    Useful when Dickey-Fuller says series is non-stationary but you don't want to difference.
    """
    rolling_mean = series.rolling(window=window).mean()
    detrended = (series - rolling_mean).dropna()
    print(f"[Preprocessing] Detrended with rolling window={window}")
    return detrended, rolling_mean