import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

def train_arma(data, p, q):
    # ARMA = ARIMA with d=0
    series = pd.Series([point.close for point in data], dtype=float)
    model = ARIMA(series, order=(p, 0, q))
    return model.fit()

def predict_arma(model, steps):
    return model.forecast(steps=steps).tolist()