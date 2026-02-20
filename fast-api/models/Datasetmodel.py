from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    fileName = Column(String)
    filePath = Column(String)
    # Using DateTime type is better for sorting; SQLAlchemy handles the conversion
    uploadDate = Column(String) 
    status = Column(String)
    userId = Column(Integer) # Matches your 'useId' in the schema