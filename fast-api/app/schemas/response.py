from pydantic import BaseModel
from typing import List, Optional, Any

class PredictionPoint(BaseModel):
    date:  str
    value: float
    type:  str = "future"
    lower: Optional[float] = None  # confidence interval lower bound
    upper: Optional[float] = None  # confidence interval upper bound

class MetricsResult(BaseModel):
    aic:  Optional[float] = None
    bic:  Optional[float] = None
    mse:  float
    rmse: float
    mae:  float
    mape: float

class PredictionResponse(BaseModel):
    predictions:    List[PredictionPoint]
    metrics:        Optional[MetricsResult] = None
    optimal_params: Optional[dict] = None   # best p,d,q found by auto-selection
    residuals:      Optional[dict] = None   # residual diagnostic results