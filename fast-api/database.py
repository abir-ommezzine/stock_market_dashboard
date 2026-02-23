from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base # Added this
from sqlalchemy.orm import sessionmaker
import os

# Updated hostname from 'db' to 'stock_db' to match your docker-compose
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@stock_db:5432/stock_market"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is the line your models.py was looking for!
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()