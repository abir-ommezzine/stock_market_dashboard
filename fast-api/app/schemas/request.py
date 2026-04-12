from pydantic import BaseModel
from typing import List

class StockDataPoint(BaseModel):
    date: str
    close: float

class MetricsRequest(BaseModel):
    y_true: List[float]
    y_pred: List[float]

class TrainRequest(BaseModel):
    data: List[StockDataPoint]
    model_type: str  # ARIMA, ARMA, SARIMA
    p: int = 1
    d: int = 1
    q: int = 1
    steps: int = 10  # prediction horizon