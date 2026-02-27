from fastapi import FastAPI
from routers import dataset_router # Import your new module
app = FastAPI(title="ML Service")

# The "glue" that connects the module to the app
app.include_router(dataset_router.router)
@app.get("/")
def health_check():
    return {"status": "all systems go"}