const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

let shapesOnCanvas = [];
let selectedShapes = []; 
let isDragging = false;
let startX = 0;
let startY = 0;
let isShiftPressed = false;

window.addEventListener('keydown', e => { if (e.key === 'Shift') isShiftPressed = true; });
window.addEventListener('keyup', e => { if (e.key === 'Shift') isShiftPressed = false; });

function cloneShape(shapeType) {
    const colorInput = document.getElementById('shape-color');
    const color = colorInput ? colorInput.value : "#00a896";

    const sizeInput = document.getElementById('shape-size');
    const size = sizeInput ? parseInt(sizeInput.value, 10) : 100;

    const spawnX = Math.floor(Math.random() * (canvas.width - 200)) + 50;
    const spawnY = Math.floor(Math.random() * (canvas.height - 200)) + 50;

    const singleShapeData = { type: shapeType, x: spawnX, y: spawnY, color: color };

    if (shapeType === 'rectangle') {
        singleShapeData.width = size; singleShapeData.height = Math.floor(size * 0.65);
    } else if (shapeType === 'circle') {
        singleShapeData.radius = Math.floor(size / 2);
    } else if (shapeType === 'triangle') {
        singleShapeData.base = size; singleShapeData.height = Math.floor(size * 0.85);
    }

    fetch('/api/clone-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shapes: [singleShapeData] })
    })
    .then(res => res.json())
    .then(newClones => {
        shapesOnCanvas.push(...newClones);
        // Выделяем созданный объект
        selectedShapes = [newClones[0]];
        updateButtonsState();
        render();
    });
}

function duplicateSelected() {
    if (selectedShapes.length === 0) return;

    fetch('/api/clone-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shapes: selectedShapes })
    })
    .then(res => res.json())
    .then(newClones => {
        shapesOnCanvas.push(...newClones);
        // Переключаем выделение на новые созданные клоны
        selectedShapes = [...newClones];
        render();
    })
    .catch(err => console.error('Ошибка группового клонирования:', err));
}

function updateButtonsState() {
    const duplicateBtn = document.getElementById('btn-duplicate');
    if (duplicateBtn) {
        duplicateBtn.disabled = selectedShapes.length === 0;
        duplicateBtn.innerHTML = selectedShapes.length > 1 
            ? `<i class="fa-solid fa-clone"></i> Дублировать группу (${selectedShapes.length})`
            : `<i class="fa-solid fa-clone"></i> Дублировать выбранное`;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapesOnCanvas.forEach(shape => {
        ctx.save();
        ctx.fillStyle = shape.color;

        const isSelected = selectedShapes.some(s => s.id === shape.id);

        if (isSelected) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0, 168, 150, 0.6)';
            ctx.strokeStyle = '#00a896';
            ctx.lineWidth = 3;
        }

        ctx.beginPath();
        if (shape.type === 'circle') {
            ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        } else if (shape.type === 'rectangle') {
            ctx.rect(shape.x - shape.width / 2, shape.y - shape.height / 2, shape.width, shape.height);
        } else if (shape.type === 'triangle') {
            ctx.moveTo(shape.x, shape.y - shape.height / 2);
            ctx.lineTo(shape.x - shape.base / 2, shape.y + shape.height / 2);
            ctx.lineTo(shape.x + shape.base / 2, shape.y + shape.height / 2);
            ctx.closePath();
        }
        ctx.fill();

        if (isSelected) ctx.stroke();
        ctx.restore();
    });
}

function checkHit(mx, my, shape) {
    if (shape.type === 'circle') {
        return Math.sqrt((mx - shape.x)**2 + (my - shape.y)**2) <= shape.radius;
    } else if (shape.type === 'rectangle') {
        return mx >= (shape.x - shape.width/2) && mx <= (shape.x + shape.width/2) &&
               my >= (shape.y - shape.height/2) && my <= (shape.y + shape.height/2);
    } else if (shape.type === 'triangle') {
        return mx >= (shape.x - shape.base/2) && mx <= (shape.x + shape.base/2) &&
               my >= (shape.y - shape.height/2) && my <= (shape.y + shape.height/2);
    }
    return false;
}

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let clickedShape = null;

    for (let i = shapesOnCanvas.length - 1; i >= 0; i--) {
        if (checkHit(mouseX, mouseY, shapesOnCanvas[i])) {
            clickedShape = shapesOnCanvas[i];
            break;
        }
    }

    if (clickedShape) {
        if (isShiftPressed) {
            const index = selectedShapes.findIndex(s => s.id === clickedShape.id);
            if (index > -1) selectedShapes.splice(index, 1);
            else selectedShapes.push(clickedShape);
        } else {
            if (!selectedShapes.some(s => s.id === clickedShape.id)) {
                selectedShapes = [clickedShape];
            }
        }
        
        isDragging = true;
        selectedShapes.forEach(s => {
            s._dragOffsetX = mouseX - s.x;
            s._dragOffsetY = mouseY - s.y;
        });
    } else {
        if (!isShiftPressed) selectedShapes = [];
    }
    
    updateButtonsState();
    render();
});

canvas.addEventListener('mousemove', e => {
    if (!isDragging || selectedShapes.length === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    selectedShapes.forEach(s => {
        s.x = mouseX - s._dragOffsetX;
        s.y = mouseY - s._dragOffsetY;
    });
    render();
});

canvas.addEventListener('mouseup', () => { isDragging = false; });

function clearCanvas() {
    shapesOnCanvas = [];
    selectedShapes = [];
    updateButtonsState();
    render();
}