from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel 
import database
# Import the class directly from the models package
from models import Stock # Simple and direct
router = APIRouter(
    prefix="/api/python/stocks",
    tags=["Stock Management"]
)

# Define the data shape right here
class StockCreate(BaseModel):
    symbol: str
    companyName: str
    currentPrice: float

@router.get("/")
def get_stocks(db: Session = Depends(database.get_db)):
    return db.query(Stock).all()

@router.post("/")
def create_stock(stock_data: StockCreate, db: Session = Depends(database.get_db)): # Removed 'schemas.'
    new_stock = Stock(**stock_data.model_dump())
    db.add(new_stock)
    db.commit()
    db.refresh(new_stock)
    return new_stock