from sqlalchemy import Column, String, Float, BigInteger
from database import Base

class Stock(Base):
    __tablename__ = "stocks"

    # Use BigInteger to match Java's 'Long' type
    id = Column(BigInteger, primary_key=True, index=True)
    symbol = Column(String(255), nullable=False)
    
    # name="xxx" tells SQLAlchemy the actual column name in Postgres
    companyName = Column(String(255), name="company_name") 
    currentPrice = Column(Float, name="current_price")