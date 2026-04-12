# CHANGES:
# 1. Extract AIC/BIC from the fitted model
# 2. Compute MSE, RMSE, MAE, MAPE from backtest vs actual values
# 3. Return metrics alongside predictions

from app.schemas.request import TrainRequest
from app.schemas.response import PredictionResponse, PredictionPoint, MetricsResult
from app.services.training_service import train_and_predict
from datetime import datetime, timedelta
import math


def run_prediction(req: TrainRequest) -> PredictionResponse:

    if not req.data:
        raise ValueError("No stock data provided for training")

    if len(req.data) < 10:
        raise ValueError(f"Not enough data points: got {len(req.data)}, need at least 10")

    # ── Split 80/20 ──
    split_index = int(len(req.data) * 0.8)
    train_data = req.data[:split_index]
    test_data  = req.data[split_index:]

    # ── Backtest: train on 80%, predict test period ──
    # train_and_predict now returns (model, predictions)
    backtest_model, backtest_preds = train_and_predict(
        data=train_data,
        model_type=req.model_type,
        p=req.p,
        d=req.d,
        q=req.q,
        steps=len(test_data)
    )

    # ── Future: train on ALL data, predict future ──
    future_model, future_preds = train_and_predict(
        data=req.data,
        model_type=req.model_type,
        p=req.p,
        d=req.d,
        q=req.q,
        steps=req.steps
    )

    # ── Compute metrics ──
    # AIC and BIC come from the future model (trained on full data — most reliable)
    # MSE, RMSE, MAE, MAPE come from comparing backtest predictions vs actual test values
    actual_values    = [float(p.close) for p in test_data]
    predicted_values = backtest_preds

    # Make sure lengths match (they should, but just in case)
    n = min(len(actual_values), len(predicted_values))
    actual_values    = actual_values[:n]
    predicted_values = predicted_values[:n]

    # MSE: average of squared differences
    mse = sum((a - p) ** 2 for a, p in zip(actual_values, predicted_values)) / n

    # RMSE: square root of MSE — same unit as the stock price ($)
    rmse = math.sqrt(mse)

    # MAE: average of absolute differences — easier to interpret than MSE
    mae = sum(abs(a - p) for a, p in zip(actual_values, predicted_values)) / n

    # MAPE: average percentage error — e.g. "model is off by 2.3% on average"
    # We guard against division by zero in case any actual value is 0
    mape = sum(
        abs((a - p) / a) * 100
        for a, p in zip(actual_values, predicted_values)
        if a != 0
    ) / n

    metrics = MetricsResult(
        # AIC/BIC: try to get from model, some models may not have them
        aic=float(future_model.aic) if hasattr(future_model, "aic") else None,
        bic=float(future_model.bic) if hasattr(future_model, "bic") else None,
        mse=round(mse, 4),
        rmse=round(rmse, 4),
        mae=round(mae, 4),
        mape=round(mape, 4),
    )

    # ── Build result list ──
    result = []

    for i, val in enumerate(backtest_preds):
        result.append(PredictionPoint(
            date=test_data[i].date,
            value=round(float(val), 4),
            type="backtest"
        ))

    last_date = datetime.strptime(req.data[-1].date, "%Y-%m-%d")
    for i, val in enumerate(future_preds):
        next_date = last_date + timedelta(days=i + 1)
        result.append(PredictionPoint(
            date=next_date.strftime("%Y-%m-%d"),
            value=round(float(val), 4),
            type="future"
        ))

    return PredictionResponse(predictions=result, metrics=metrics)