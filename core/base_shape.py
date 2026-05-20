import copy
from abc import ABC, abstractmethod

class Shape(ABC):
    def __init__(self, id=None, x=0, y=0, color="#ffffff"):
        self.id = id          
        self.x = x           
        self.y = y            
        self.color = color   

    def clone(self):
        return copy.deepcopy(self)

    def to_dict(self):
        return {
            "type": self.__class__.__name__.lower(),
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "color": self.color,
            **self._get_specific_props()
        }

    @abstractmethod
    def _get_specific_props(self):
        """Каждая фигура вернет свои уникальные свойства (радиус, ширину и т.д.)"""
        pass