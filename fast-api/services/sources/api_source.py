import requests
from .base_source import DataSource

class APISource(DataSource):

    def load(self, config: dict):

        url = config["apiUrl"]

        response = requests.get(url)

        return response.json()