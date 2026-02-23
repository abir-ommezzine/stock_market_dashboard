from database import Base
from .stockmodels import Stock      # Use your actual filename here
from .Datasetmodel import Dataset  # Use your actual filename here

# This helps the "metadata.create_all" find your tables
__all__ = ["Base", "Stock", "Dataset"]