from abc import ABC, abstractmethod

class DataSource(ABC):

    @abstractmethod
    def load(self, config: dict):
        pass