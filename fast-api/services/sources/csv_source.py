import pandas as pd
from .base_source import DataSource

class CSVSource(DataSource):

    def load(self, config: dict):

        path = config["filePath"]

        df = pd.read_csv(path)

        return df.to_dict()