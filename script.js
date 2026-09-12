const imageInput = document.getElementById('imageInput');
const eyedropperBtn = document.getElementById('eyedropperBtn');
const paintBtn = document.getElementById('paintBtn');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');
const downloadBtn = document.getElementById('downloadBtn');

const brushColorInput = document.getElementById('brushColor');
const brushSizeInput = document.getElementById('brushSize');
const paletteButtons = document.querySelectorAll('.palette-btn');

const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const colorPreview = document.getElementById('colorPreview');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');

let isPaintingMode = false;
let isEraserMode = false;
let isDrawing = false;

let historyStack = [];
let originalImage = null;

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        originalImage = img;
        historyStack = [];
        saveState();

        eyedropperBtn.disabled = false;
        paintBtn.disabled = false;
        eraserBtn.disabled = false;
        undoBtn.disabled = false;
        downloadBtn.disabled = false;
        brushColorInput.disabled = false;
        brushSizeInput.disabled = false;
    };

    img.src = URL.createObjectURL(file);
});

function saveState() {
    historyStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

eyedropperBtn.addEventListener('click', async () => {
    if ('EyeDropper' in window) {
        try {
            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            updateColorDisplay(result.sRGBHex);
        } catch (err) {
            console.log("Eyedropper closed without selection.");
        }
    } else {
        alert("Your browser doesn't support EyeDropper API. Use Chrome, Edge, or Opera.");
    }
});

paletteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const selectedColor = e.target.getAttribute('data-color');
        brushColorInput.value = selectedColor;
    });
});

paintBtn.addEventListener('click', () => {
    isPaintingMode = !isPaintingMode;
    if (isPaintingMode) isEraserMode = false;
    updateToolStates();
});

eraserBtn.addEventListener('click', () => {
    isEraserMode = !isEraserMode;
    if (isEraserMode) isPaintingMode = false;
    updateToolStates();
});

function updateToolStates() {
    if (isPaintingMode) {
        paintBtn.textContent = "🎨 Paint Mode: ON";
        paintBtn.classList.add('active');
    } else {
        paintBtn.textContent = "🎨 Paint Mode: OFF";
        paintBtn.classList.remove('active');
    }

    if (isEraserMode) {
        eraserBtn.textContent = "🧹 Eraser: ON";
        eraserBtn.classList.add('active');
    } else {
        eraserBtn.textContent = "🧹 Eraser: OFF";
        eraserBtn.classList.remove('active');
    }

    if (isPaintingMode || isEraserMode) {
        canvas.classList.add('painting-active');
    } else {
        canvas.classList.remove('painting-active');
    }
}

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    if (!isPaintingMode && !isEraserMode) return;
    isDrawing = true;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isEraserMode) {
        eraseAtPoint(x, y);
    }
}

function draw(e) {
    if (!isDrawing) return;

    const { x, y } = getCanvasCoordinates(e);

    if (isPaintingMode) {
        ctx.lineTo(x, y);
        ctx.strokeStyle = brushColorInput.value;
        ctx.lineWidth = brushSizeInput.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    } else if (isEraserMode) {
        eraseAtPoint(x, y);
    }
}

function eraseAtPoint(x, y) {
    const radius = brushSizeInput.value / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(originalImage, 0, 0);
    ctx.restore();
}

function stopDrawing() {
    if (isDrawing) {
        saveState();
    }
    isDrawing = false;
    ctx.beginPath();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

undoBtn.addEventListener('click', () => {
    if (historyStack.length > 1) {
        historyStack.pop();
        const previousState = historyStack[historyStack.length - 1];
        ctx.putImageData(previousState, 0, 0);
    }
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

function updateColorDisplay(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    colorPreview.style.backgroundColor = hex;
    hexValue.textContent = hex.toUpperCase();
    rgbValue.textContent = `rgb(${r}, ${g}, ${b})`;

    brushColorInput.value = hex;
}