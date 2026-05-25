import uuid
import os
from flask import Flask, render_template, jsonify, request
from core.registry import ShapeRegistry
from core.concrete_shapes import Circle, Rectangle, Triangle

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response

# Инициализация хранилища (Реестра прототипов) с дефолтными фигурами
registry = ShapeRegistry()
registry.register_prototype("rectangle", Rectangle(color="#00a896", width=120, height=80))
registry.register_prototype("circle", Circle(color="#f43f5e", radius=50))
registry.register_prototype("triangle", Triangle(color="#f59e0b", base=100, height=80))

@app.route('/')
def index(): 
    return render_template('index.html')

@app.route('/editor')
def editor(): 
    return render_template('editor.html')

@app.route('/docs')
def docs(): 
    return render_template('docs.html')


@app.route('/api/clone-group', methods=['POST'])
def clone_group():
    """Универсальный эндпоинт для одиночного и ГРУППОВОГО клонирования"""
    data = request.json or {}
    shapes_to_clone = data.get('shapes', [])
    
    if not shapes_to_clone:
        return jsonify({"error": "Нет данных для клонирования"}), 400
        
    cloned_results = []
    
    for item in shapes_to_clone:
        shape_type = item.get('type')
        
        if 'id' in item:
            temp_shape = registry.get_clone(shape_type)
            if temp_shape:
                if item.get('color'): temp_shape.color = item.get('color')
                if item.get('x') is not None: temp_shape.x = int(item.get('x'))
                if item.get('y') is not None: temp_shape.y = int(item.get('y'))
                
                if shape_type == "rectangle":
                    if item.get('width'): temp_shape.width = int(item.get('width'))
                    if item.get('height'): temp_shape.height = int(item.get('height'))
                elif shape_type == "circle":
                    if item.get('radius'): temp_shape.radius = int(item.get('radius'))
                elif shape_type == "triangle":
                    if item.get('base'): temp_shape.base = int(item.get('base'))
                    if item.get('height'): temp_shape.height = int(item.get('height'))
                
                cloned_shape = temp_shape.clone()
        else:
            cloned_shape = registry.get_clone(shape_type)
            if cloned_shape:
                if item.get('color'): cloned_shape.color = item.get('color')
                if item.get('x') is not None: cloned_shape.x = int(item.get('x'))
                if item.get('y') is not None: cloned_shape.y = int(item.get('y'))
                if shape_type == "rectangle":
                    cloned_shape.width = int(item.get('width', cloned_shape.width))
                    cloned_shape.height = int(item.get('height', cloned_shape.height))
                elif shape_type == "circle":
                    cloned_shape.radius = int(item.get('radius', cloned_shape.radius))
                elif shape_type == "triangle":
                    cloned_shape.base = int(item.get('base', cloned_shape.base))
                    cloned_shape.height = int(item.get('height', cloned_shape.height))

        if cloned_shape:
            cloned_shape.id = str(uuid.uuid4())
            cloned_shape.x += 30
            cloned_shape.y += 30
            cloned_results.append(cloned_shape.to_dict())
            
    return jsonify(cloned_results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)