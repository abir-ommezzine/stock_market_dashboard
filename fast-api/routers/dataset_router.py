from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel 
import database
# Import the class directly from the models folder/package
from models import Dataset


router = APIRouter(
    prefix="/api/python/dataset",
    tags=["Dataset Management"]
)

# 3. Define the Schema locally here
class DatasetCreate(BaseModel):
    fileName: str
    filePath: str
    uploadDate: str
    status: str
    userId: int

@router.get("/")
def get_datasets(db: Session = Depends(database.get_db)):
    return db.query(Dataset).all()

@router.post("/")
def create_dataset(dataset_data: DatasetCreate, db: Session = Depends(database.get_db)): # 4. Removed 'schemas.'
    new_dataset = Dataset(**dataset_data.model_dump())
    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)
    return new_dataset