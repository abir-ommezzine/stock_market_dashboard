# CHANGES:
# Wires all services together into one automated pipeline:
# 1. Preprocess → 2. Find d → 3. Auto-select p,q → 4. Train → 5. Check residuals
# 6. Compute confidence intervals → 7. Cache model → 8. Return everything

from app.schemas.request import TrainRequest
from app.schemas.response import PredictionResponse, PredictionPoint, MetricsResult
from app.services.preprocessing_service import preprocess, invert_transforms
from app.services.stationarity_service import find_optimal_d
from app.services.order_selection_service import auto_select_order
from app.services.residual_service import check_residuals
from app.services.model_cache_service import save_model, load_model
from app.services.training_service import train_and_predict
from datetime import datetime, timedelta
import math
import numpy as np


def run_prediction(req: TrainRequest) -> PredictionResponse:

    if not req.data:
        raise ValueError("No stock data provided")
    if len(req.data) < 10:
        raise ValueError(f"Need at least 10 data points, got {len(req.data)}")

    # ── 1. Preprocess ──
    # Clean data, optionally apply log transform or pct_change
    series, meta = preprocess(req.data,use_pct_change=True)

    # ── 2. Find optimal d via Dickey-Fuller ──
    # Only auto-select d if user didn't provide a custom value
    # Default d=1 means "use auto-selection"
    if req.d == 1:
        optimal_d, _ = find_optimal_d(series)
    else:
        optimal_d = req.d  # respect user's explicit choice

    # ── 3. Auto-select p and q ──
    # Only auto-select if user is using defaults (p=1, q=1)
    if req.p == 1 and req.q == 1:
        order_result = auto_select_order(
            series,
            d=optimal_d,
            model_type=req.model_type.lower()
        )
        best_p = order_result["p"]
        best_q = order_result["q"]
        print(f"[Prediction] Auto-selected: p={best_p}, d={optimal_d}, q={best_q}")
    else:
        best_p = req.p
        best_q = req.q
        print(f"[Prediction] Using user params: p={best_p}, d={optimal_d}, q={best_q}")

    # ── 4. Split 80/20 for backtesting ──
    split_index = int(len(req.data) * 0.8)
    train_data  = req.data[:split_index]
    test_data   = req.data[split_index:]

    # ── 5. Backtest predictions ──
    backtest_model, backtest_preds = train_and_predict(
        data=train_data,
        model_type=req.model_type,
        p=best_p,
        d=optimal_d,
        q=best_q,
        steps=len(test_data)
    )

    # ── 6. Future predictions with confidence intervals ──
    # Check cache first — avoid retraining if same config was used before
    symbol = getattr(req, "symbol", "unknown")
    cached = load_model(symbol, req.model_type, best_p, optimal_d, best_q, len(req.data))

    if cached:
        future_model = cached
    else:
        future_model, _ = train_and_predict(
            data=req.data,
            model_type=req.model_type,
            p=best_p,
            d=optimal_d,
            q=best_q,
            steps=req.steps
        )
        save_model(future_model, symbol, req.model_type, best_p, optimal_d, best_q, len(req.data))

    # Get forecast with confidence intervals
    # get_forecast returns an object with predicted_mean + conf_int
    forecast_result = future_model.get_forecast(steps=req.steps)
    future_preds    = forecast_result.predicted_mean.tolist()

    # Confidence interval: 95% by default
    # conf_int is a DataFrame with columns "lower" and "upper"
    conf_int = forecast_result.conf_int(alpha=0.05)
    lower_bounds = conf_int.iloc[:, 0].tolist()
    upper_bounds = conf_int.iloc[:, 1].tolist()

    # ── 7. Check residuals ──
    residual_diagnostics = check_residuals(future_model)

    # ── 8. Compute metrics ──
    actual_values    = [float(p.close) for p in test_data]
    predicted_values = backtest_preds
    n = min(len(actual_values), len(predicted_values))
    actual_values    = actual_values[:n]
    predicted_values = predicted_values[:n]

    mse  = sum((a - p) ** 2 for a, p in zip(actual_values, predicted_values)) / n
    rmse = math.sqrt(mse)
    mae  = sum(abs(a - p) for a, p in zip(actual_values, predicted_values)) / n
    mape = sum(
        abs((a - p) / a) * 100
        for a, p in zip(actual_values, predicted_values) if a != 0
    ) / n

    metrics = MetricsResult(
        aic=float(future_model.aic) if hasattr(future_model, "aic") else None,
        bic=float(future_model.bic) if hasattr(future_model, "bic") else None,
        mse=round(mse, 4),
        rmse=round(rmse, 4),
        mae=round(mae, 4),
        mape=round(mape, 4),
    )

    # ── 9. Build result ──
    result = []

    # Backtest points
    for i, val in enumerate(backtest_preds):
        result.append(PredictionPoint(
            date=test_data[i].date,
            value=round(float(val), 4),
            type="backtest"
        ))

    # Future points with confidence intervals
    last_date = datetime.strptime(req.data[-1].date, "%Y-%m-%d")
    for i, val in enumerate(future_preds):
        next_date = last_date + timedelta(days=i + 1)
        result.append(PredictionPoint(
            date=next_date.strftime("%Y-%m-%d"),
            value=round(float(val), 4),
            type="future",
            lower=round(float(lower_bounds[i]), 4),  # confidence interval lower
            upper=round(float(upper_bounds[i]), 4),  # confidence interval upper
        ))

    return PredictionResponse(
        predictions=result,
        metrics=metrics,
        optimal_params={
            "p":int(best_p),
            "d": int(optimal_d),
            "q": int(best_q)
        },  # send back to frontend
        residuals=residual_diagnostics,
    )