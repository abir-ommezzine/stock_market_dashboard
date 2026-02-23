from fastapi import FastAPI

from routers import stock_router # Import your new module
from routers import dataset_router # Import your new module
app = FastAPI(title="Stock Project API")

# The "glue" that connects the module to the app
app.include_router(stock_router.router)
app.include_router(dataset_router.router)
@app.get("/")
def health_check():
    return {"status": "all systems go"}