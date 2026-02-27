from fastapi import APIRouter
from services.datasource_service import load_dataset

router = APIRouter(prefix="/dataset", tags=["Dataset"])

@router.post("/load")
def load(data: dict):
    return load_dataset(data)

@router.get("/sources")
def get_sources():
    return [
        {"label": "Yahoo Finance", "value": "yahoo"},
        {"label": "Alpha Vantage", "value": "alphavantage"},
        {"label": "Binance", "value": "binance"},
        {"label": "CSV Upload", "value": "csv"},
        {"label": "Custom API", "value": "api"},
    ]