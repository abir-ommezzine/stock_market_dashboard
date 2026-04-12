import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

def train_arima(data, p, d, q):
    series = pd.Series([point.close for point in data], dtype=float)
    model = ARIMA(series, order=(p, d, q))
    return model.fit()

def predict_arima(model, steps):
    return model.forecast(steps=steps).tolist()