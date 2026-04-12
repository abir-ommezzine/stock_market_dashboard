from pydantic import BaseModel
from typing import List, Optional


class PredictionPoint(BaseModel):
    date: str
    value: float
    type:str="future"
class MetricsResult(BaseModel):
    aic:Optional[float]=None
    bic:Optional[float]=None
    mse:float
    rmse:float
    mae:float
    mape:float
class PredictionResponse(BaseModel):
    predictions: List[PredictionPoint]
    metrics: Optional[MetricsResult]=None