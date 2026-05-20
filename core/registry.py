class ShapeRegistry:
    def __init__(self):
        self._prototypes = {}

    def register_prototype(self, name, shape):
        self._prototypes[name] = shape

    def get_clone(self, name):
        prototype = self._prototypes.get(name)
        if prototype:
            return prototype.clone() 
        return None