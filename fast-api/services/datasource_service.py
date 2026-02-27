from services.sources.yahoo_source import YahooSource
from services.sources.csv_source import CSVSource
from services.sources.api_source import APISource


sources = {
    "yahoo": YahooSource(),
    "csv": CSVSource(),
    "api": APISource(),
}


def load_dataset(config: dict):

    source = config.get("source")

    if source not in sources:
        raise Exception(f"Unsupported source{source}")

    return sources[source].load(config)