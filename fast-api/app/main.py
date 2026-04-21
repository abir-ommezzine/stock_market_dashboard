from fastapi import FastAPI, HTTPException
from app.schemas.request import TrainRequest, MetricsRequest
from app.schemas.response import PredictionResponse
from app.services.prediction_service import run_prediction
from app.services.metrics_service import compute_metrics

app = FastAPI()

@app.post("/train", response_model=PredictionResponse)
def train_model(req: TrainRequest):
    try:
        return run_prediction(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/metrics")
def metrics(req: MetricsRequest):
    return compute_metrics(req.y_true, req.y_pred)