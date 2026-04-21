from app.models.arima_model import train_arima, predict_arima
from app.models.arma_model import train_arma, predict_arma
from app.models.sarima_model import train_sarima, predict_sarima

def train_and_predict(data, model_type, p, d, q, steps):
    model_type = model_type.lower()

    if model_type == "arima":
        model = train_arima(data, p, d, q)
        preds=predict_arima(model, steps)

    elif model_type == "arma":
        model = train_arma(data, p, q)
        preds=predict_arma(model, steps)

    elif model_type == "sarima":
        model = train_sarima(data, p, d, q)
        preds = predict_sarima(model, steps)

    else:
        raise ValueError(f"Unsupported model type: {model_type}. Choose ARIMA, ARMA, or SARIMA.")
    return model,preds