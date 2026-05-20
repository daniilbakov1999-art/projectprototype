import copy

class BaseShape:
    def __init__(self, color, x=150, y=150):
        self.id = None
        self.color = color
        self.x = x
        self.y = y
        self.metadata = {
            "border_style": "solid",
            "border_width": 2,
            "tags": ["prototype_derived"]
        }

    def clone(self):
        """Реализация честного глубокого копирования (Deep Copy)"""
        # copy.deepcopy рекурсивно копирует сам объект и все вложенные
        new_shape = copy.deepcopy(self)
        return new_shape


class Rectangle(BaseShape):
    def __init__(self, color, width, height):
        super().__init__(color)
        self.type = "rectangle"
        self.width = width
        self.height = height

    def to_dict(self):
        return {
            "id": self.id, "type": self.type, "color": self.color,
            "x": self.x, "y": self.y, "width": self.width, "height": self.height,
            "metadata": self.metadata
        }


class Circle(BaseShape):
    def __init__(self, color, radius):
        super().__init__(color)
        self.type = "circle"
        self.radius = radius

    def to_dict(self):
        return {
            "id": self.id, "type": self.type, "color": self.color,
            "x": self.x, "y": self.y, "radius": self.radius,
            "metadata": self.metadata
        }


class Triangle(BaseShape):
    def __init__(self, color, base, height):
        super().__init__(color)
        self.type = "triangle"
        self.base = base
        self.height = height

    def to_dict(self):
        return {
            "id": self.id, "type": self.type, "color": self.color,
            "x": self.x, "y": self.y, "base": self.base, "height": self.height,
            "metadata": self.metadata
        }