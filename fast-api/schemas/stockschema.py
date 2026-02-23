from pydantic import BaseModel

# 1. This defines what a Stock looks like
class StockBase(BaseModel):
    symbol: str
    companyName: str
    currentPrice: float

# 2. This is what the error 'AttributeError: module schemas has no attribute StockCreate' is looking for
class StockCreate(StockBase):
    pass

# 3. This is what the API sends back to the user (includes the ID)
class Stock(StockBase):
    id: int

    class Config:
        from_attributes = True