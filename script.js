const imageInput = document.getElementById('imageInput');
const eyedropperBtn = document.getElementById('eyedropperBtn');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const colorPreview = document.getElementById('colorPreview');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');

let loadedImage = null;

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        eyedropperBtn.disabled = false;
        loadedImage = img;
    };

    img.src = URL.createObjectURL(file);
});

eyedropperBtn.addEventListener('click', async () => {
    if ('EyeDropper' in window) {
        try {
            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            const hex = result.sRGBHex;
            updateColorDisplay(hex);
        } catch (err) {
            console.log("EyeDropper was canceled.");
        }
    } else {
        alert("Your browser does not support the EyeDropper API. Please try Google Chrome, Microsoft Edge, or Opera.");
    }
});

function updateColorDisplay(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    colorPreview.style.backgroundColor = hex;
    hexValue.textContent = hex.toUpperCase();
    rgbValue.textContent = `rgb(${r}, ${g}, ${b})`;
}