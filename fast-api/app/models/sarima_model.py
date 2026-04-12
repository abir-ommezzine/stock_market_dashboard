import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

def train_sarima(data, p, d, q):
    series = pd.Series([point.close for point in data], dtype=float)
    model = SARIMAX(series, order=(p, d, q), seasonal_order=(1, 1, 1, 12))
    return model.fit(disp=False)

def predict_sarima(model, steps):
    return model.forecast(steps=steps).tolist()