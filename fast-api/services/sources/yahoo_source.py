import yfinance as yf
from .base_source import DataSource

class YahooSource(DataSource):

    def load(self, config: dict):

        ticker = config["symbol"]
        start = config.get("start")
        end = config.get("end")

        data = yf.download(ticker, start=start, end=end)

        return data.reset_index().to_dict(orient="records")