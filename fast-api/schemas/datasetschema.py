from pedantic import BaseModel

class DatasetBase(BaseModel):
    fileName: str
    filePath: str
    uploadDate: str
    status: str
    useId: int


class DatasetCreate(DatasetBase):
    pass

class Dataset(DatasetBase):
    id: int

    class Config:
        from_attributes = True