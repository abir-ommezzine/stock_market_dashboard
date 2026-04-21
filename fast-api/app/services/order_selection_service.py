# Two approaches to finding optimal p, q:
# 1. ACF/PACF analysis (fast, heuristic)
# 2. AIC/BIC grid search (slower, exhaustive, more reliable)
# 3. auto_arima from pmdarima (automated, combines both)

import pandas as pd
import numpy as np
import warnings
from statsmodels.tsa.stattools import acf, pacf
from typing import Optional
import joblib
import os

# pmdarima wraps statsmodels and automates the search process
# pip install pmdarima
try:
    import pmdarima as pm
    PMDARIMA_AVAILABLE = True
except ImportError:
    PMDARIMA_AVAILABLE = False
    print("[OrderSelection] pmdarima not available, falling back to grid search")


def suggest_pq_from_acf_pacf(series: pd.Series, max_lag: int = 20) -> dict:
    """
    Use ACF and PACF plots to suggest p and q ranges.

    - PACF cuts off at lag p  → suggests AR order (p)
    - ACF cuts off at lag q   → suggests MA order (q)

    A "significant" lag is one where the value exceeds the 95% confidence bound (2/sqrt(n)).
    """
    n = len(series)
    confidence_bound = 2 / np.sqrt(n)  # 95% CI for ACF/PACF

    # Compute ACF and PACF values
    acf_values  = acf(series.dropna(),  nlags=max_lag, fft=True)
    pacf_values = pacf(series.dropna(), nlags=max_lag)

    # Find where PACF first drops below the confidence bound → suggests p
    suggested_p = 0
    for i in range(1, len(pacf_values)):
        if abs(pacf_values[i]) > confidence_bound:
            suggested_p = i
        else:
            break  # stop at first non-significant lag

    # Find where ACF first drops below the confidence bound → suggests q
    suggested_q = 0
    for i in range(1, len(acf_values)):
        if abs(acf_values[i]) > confidence_bound:
            suggested_q = i
        else:
            break

    # Cap suggestions to reasonable values
    suggested_p = max(1,min(suggested_p, 5))
    suggested_q = max(1,min(suggested_q, 5))

    print(f"[OrderSelection] ACF/PACF suggests p={suggested_p}, q={suggested_q}")

    return {
        "suggested_p": suggested_p,
        "suggested_q": suggested_q,
        "confidence_bound": round(confidence_bound, 4),
    }


def grid_search_aic_bic(
    series: pd.Series,
    p_range: range,
    d: int,
    q_range: range,
    model_type: str = "arima"
) -> pd.DataFrame:
    """
    Try all combinations of (p, d, q) and record AIC/BIC scores.
    Returns a DataFrame sorted by AIC so you can see the best models.

    Uses a try/except block so failed combinations don't crash the search.
    """
    from statsmodels.tsa.arima.model import ARIMA
    from statsmodels.tsa.statespace.sarimax import SARIMAX

    results = []

    total = len(p_range) * len(q_range)
    print(f"[GridSearch] Testing {total} (p,q) combinations with d={d}...")

    for p in p_range:
        for q in q_range:

            # CHANGE: skip degenerate models where both p and q are 0
            # (0,d,0) is a random walk — useless for forecasting
            if p == 0 and q == 0:
                print(f"[GridSearch] Skipping degenerate model (0,{d},0)")
                continue

            try:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")

                    if model_type == "sarima":
                        model = SARIMAX(
                            series,
                            order=(p, d, q),
                            seasonal_order=(1, 1, 1, 12)
                        ).fit(disp=False)
                    else:
                        model = ARIMA(series, order=(p, d, q)).fit()

                results.append({
                    "p": int(p),
                    "d": int(d),
                    "q": int(q),
                    "aic": round(float(model.aic), 2),
                    "bic": round(float(model.bic), 2),
                })

            except Exception as e:
                print(f"[GridSearch] Failed for ({p},{d},{q}): {e}")
                # CHANGE: don't add failed models at all instead of using inf
                # inf values were polluting the results DataFrame
    if not results:
        # Absolute fallback if everything failed
        print("[GridSearch] All combinations failed, using (1,d,1) as fallback")
        return pd.DataFrame([{"p": 1, "d": d, "q": 1, "aic": 9999.0, "bic": 9999.0}])
    # Build DataFrame and sort by AIC (best model first)

    df = pd.DataFrame(results)

    # CHANGE: sort by BIC instead of AIC
    # BIC penalizes complexity more than AIC, giving more meaningful models
    # than AIC which often prefers the simplest (0,d,0) model
    df = df.sort_values("bic").reset_index(drop=True)
    print(
        f"[GridSearch] Best model: "
        f"p={df.iloc[0]['p']}, d={df.iloc[0]['d']}, q={df.iloc[0]['q']}, "
        f"AIC={df.iloc[0]['aic']}, BIC={df.iloc[0]['bic']}"
    )

    return df


# CHANGE: cast all numpy numeric types to native Python int/float before returning

def auto_select_order(series, d: int, model_type: str = "arima") -> dict:

    if PMDARIMA_AVAILABLE and model_type != "sarima":
        try:
            auto_model = pm.auto_arima(
                series,
                d=d,
                start_p=1, max_p=5,
                start_q=1, max_q=5,
                seasonal=False,
                stepwise=True,
                information_criterion="bic",
                error_action="ignore",
                suppress_warnings=True,
            )

            best_p, best_d, best_q = auto_model.order
            # CHANGE: if auto_arima still picks (0,d,0), force minimum (1,d,1)
            if best_p == 0 and best_q == 0:
                print("[OrderSelection] auto_arima returned degenerate (0,d,0), forcing (1,d,1)")
                best_p, best_q = 1, 1

            print(f"[OrderSelection] auto_arima best order: ({best_p},{best_d},{best_q})")
            return {
                # CHANGE: int() and float() convert numpy types to native Python
                "p":      int(best_p),
                "d":      int(best_d),
                "q":      int(best_q),
                "method": "auto_arima",
                "aic":    round(float(auto_model.aic()), 2),
                "search_results": None,
            }
        except Exception as e:
            print(f"[OrderSelection] auto_arima failed: {e}, falling back to grid search")

    # Fallback: grid search
    acf_pacf = suggest_pq_from_acf_pacf(series)
    max_p = max(acf_pacf["suggested_p"] + 2, 4)
    max_q = max(acf_pacf["suggested_q"] + 2, 4)

    df = grid_search_aic_bic(
        series,
        p_range=range(0, max_p + 1),
        d=d,
        q_range=range(0, max_q + 1),
        model_type=model_type,
    )

    best = df.iloc[0]

    return {
        # CHANGE: int() converts numpy.int64 → Python int, float() converts numpy.float64
        "p":      int(best["p"]),
        "d":      int(d),
        "q":      int(best["q"]),
        "method": "grid_search",
        "aic":    float(best["aic"]),
        # CHANGE: convert each row to native Python types before returning
        "search_results": [
            {
                "p":   int(row["p"]),
                "d":   int(row["d"]),
                "q":   int(row["q"]),
                "aic": float(row["aic"]),
                "bic": float(row["bic"]),
            }
            for row in df.to_dict(orient="records")
        ],
    }