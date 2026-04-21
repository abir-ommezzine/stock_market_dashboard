# Runs the Augmented Dickey-Fuller test to check if a series is stationary
# If not stationary, applies differencing until it becomes stationary
# This tells us the optimal value of d for ARIMA/SARIMA

import pandas as pd
from statsmodels.tsa.stattools import adfuller
from typing import Tuple


def check_stationarity(series: pd.Series) -> dict:
    """
    Run the Augmented Dickey-Fuller (ADF) test.

    The ADF test checks the null hypothesis that the series has a unit root
    (i.e. is non-stationary). A small p-value (< 0.05) means we reject the
    null hypothesis → series IS stationary.

    Returns a dict with test results and interpretation.
    """
    result = adfuller(series.dropna())

    is_stationary = result[1] < 0.05  # p-value < 0.05 means stationary

    output = {
        "test_statistic": round(result[0], 4),
        "p_value":        round(result[1], 4),
        "is_stationary":  is_stationary,
        "interpretation": (
            "Series is stationary (p < 0.05) — no differencing needed"
            if is_stationary else
            "Series is NOT stationary (p ≥ 0.05) — differencing required"
        )
    }

    print(f"[Stationarity] ADF test: stat={output['test_statistic']}, "
          f"p={output['p_value']}, stationary={is_stationary}")

    return output


def find_optimal_d(series: pd.Series, max_d: int = 3) -> Tuple[int, pd.Series]:
    """
    Find the minimum number of differences needed to make the series stationary.
    This gives us the optimal value of d for ARIMA.

    Tries d=0, 1, 2, ... until ADF test says stationary.
    Returns (d, differenced_series).
    """
    current_series = series.copy()

    for d in range(max_d + 1):
        result = check_stationarity(current_series)

        if result["is_stationary"]:
            print(f"[Stationarity] Optimal d = {d}")
            return d, current_series

        # Apply one more round of differencing and try again
        # diff() computes: value[t] - value[t-1]
        current_series = current_series.diff().dropna()

    print(f"[Stationarity] Could not achieve stationarity within d={max_d}, using d={max_d}")
    return max_d, current_series