document.addEventListener('DOMContentLoaded', () => {
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const editorSection = document.getElementById('editorSection');
    const previewImage = document.getElementById('previewImage');
    const rotateLeftBtn = document.getElementById('rotateLeft');
    const rotateRightBtn = document.getElementById('rotateRight');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const downloadBtn = document.getElementById('download');
    const resetBtn = document.getElementById('resetBtn');
    const zoomLevel = document.getElementById('zoomLevel');
    const sizeSelect = document.getElementById('sizeSelect');
    const bgButtons = document.querySelectorAll('.bg-btn');


    // Check if all elements exist before adding event listeners
    if (!uploadBox || !fileInput || !editorSection || !previewImage || 
        !rotateLeftBtn || !rotateRightBtn || !zoomInBtn || !zoomOutBtn || 
        !downloadBtn || !resetBtn || !zoomLevel || !sizeSelect) {
        console.error('Missing DOM element for event listener:', {
            uploadBox: uploadBox,
            fileInput: fileInput,
            editorSection: editorSection,
            previewImage: previewImage,
            rotateLeftBtn: rotateLeftBtn,
            rotateRightBtn: rotateRightBtn,
            zoomInBtn: zoomInBtn,
            zoomOutBtn: zoomOutBtn,
            downloadBtn: downloadBtn,
            resetBtn: resetBtn,
            zoomLevel: zoomLevel,
            sizeSelect: sizeSelect
        });
        return;
    }

    let rotation = 0;
    let scale = 1;
    let currentBg = 'white';
    let originalImage = null;

    // Upload functionality
    uploadBox.addEventListener('click', () => fileInput.click());
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#2980b9';
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = '#3498db';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#3498db';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImage(file);
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImage(file);
        }
    });

    function handleImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage = e.target.result;
            previewImage.src = originalImage;
            editorSection.style.display = 'block';
            updateTransform();
            // Scroll to editor
            editorSection.scrollIntoView({ behavior: 'smooth' });
        };
        reader.readAsDataURL(file);
    }

    // Image manipulation
    rotateLeftBtn.addEventListener('click', () => {
        rotation -= 90;
        updateTransform();
    });

    rotateRightBtn.addEventListener('click', () => {
        rotation += 90;
        updateTransform();
    });

    zoomInBtn.addEventListener('click', () => {
        if (scale < 3) {
            scale += 0.1;
            updateTransform();
        }
    });

    zoomOutBtn.addEventListener('click', () => {
        if (scale > 0.3) {
            scale -= 0.1;
            updateTransform();
        }
    });

    // Reset functionality
    resetBtn.addEventListener('click', () => {
        rotation = 0;
        scale = 1;
        currentBg = 'white';
        originalImage = null;
        previewImage.src = '';
        editorSection.style.display = 'none';
        updateTransform();
        updateBgButtons();
    });

    // Background color functionality
    bgButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentBg = btn.dataset.bg;
            updateBackground();
            updateBgButtons();
        });
    });

    // Custom color picker functionality
    const customBgColor = document.getElementById('customBgColor');
    if (customBgColor) {
        customBgColor.addEventListener('change', (e) => {
            currentBg = 'custom';
            updateBackground();
            updateBgButtons();
        });
    }

    function updateBgButtons() {
        bgButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.bg === currentBg) {
                btn.classList.add('active');
            }
        });
        
        // Handle custom color selection
        if (currentBg === 'custom' && customBgColor) {
            customBgColor.style.border = '3px solid #667eea';
            customBgColor.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.3)';
        } else if (customBgColor) {
            customBgColor.style.border = 'none';
            customBgColor.style.boxShadow = 'none';
        }
    }

    function updateBackground() {
        const previewContainer = document.querySelector('.preview-container');
        const colors = {
            white: '#ffffff',
            blue: '#3498db',
            red: '#e74c3c',
            green: '#27ae60',
            gray: '#95a5a6',
            cream: '#f4e4bc',
            transparent: 'transparent'
        };
        
        // Handle custom color
        if (currentBg === 'custom' && customBgColor) {
            previewContainer.style.backgroundColor = customBgColor.value;
        } else {
            previewContainer.style.backgroundColor = colors[currentBg];
        }
        
        // Handle transparent background
        if (currentBg === 'transparent') {
            previewContainer.style.backgroundImage = `
                linear-gradient(45deg, #ccc 25%, transparent 25%), 
                linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #ccc 75%), 
                linear-gradient(-45deg, transparent 75%, #ccc 75%)
            `;
            previewContainer.style.backgroundSize = '20px 20px';
            previewContainer.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
        } else {
            previewContainer.style.backgroundImage = 'none';
        }
    }

    function updateTransform() {
        previewImage.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        zoomLevel.textContent = Math.round(scale * 100) + '%';
    }

    // Download functionality
    downloadBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Get selected size
        const selectedSize = sizeSelect.value;
        let width, height;
        
        switch(selectedSize) {
            case '35x45':
                width = 413; // 35mm at 300dpi
                height = 531; // 45mm at 300dpi
                break;
            case '2x2':
                width = 600; // 2 inches at 300dpi
                height = 600; // 2 inches at 300dpi
                break;
            case '33x48':
                width = 390; // 33mm at 300dpi
                height = 567; // 48mm at 300dpi
                break;
            default:
                width = 413;
                height = 531;
        }
        
        canvas.width = width;
        canvas.height = height;

        // Set background color
        const colors = {
            white: '#ffffff',
            blue: '#3498db',
            red: '#e74c3c',
            green: '#27ae60',
            gray: '#95a5a6',
            cream: '#f4e4bc',
            transparent: '#ffffff' // Will be handled separately
        };
        
        // Handle custom color
        if (currentBg === 'custom' && customBgColor) {
            ctx.fillStyle = customBgColor.value;
        } else if (currentBg === 'transparent') {
            // Create transparent background pattern
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = 20;
            patternCanvas.height = 20;
            const patternCtx = patternCanvas.getContext('2d');
            
            patternCtx.fillStyle = '#cccccc';
            patternCtx.fillRect(0, 0, 10, 10);
            patternCtx.fillRect(10, 10, 10, 10);
            patternCtx.fillStyle = '#ffffff';
            patternCtx.fillRect(10, 0, 10, 10);
            patternCtx.fillRect(0, 10, 10, 10);
            
            const pattern = ctx.createPattern(patternCanvas, 'repeat');
            ctx.fillStyle = pattern;
        } else {
            ctx.fillStyle = colors[currentBg];
        }
        
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the image with current transformations
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(rotation * Math.PI/180);
        ctx.scale(scale, scale);
        
        const img = new Image();
        img.onload = () => {
            // Calculate dimensions to fit the canvas
            const imgAspect = img.width / img.height;
            const canvasAspect = canvas.width / canvas.height;
            let drawWidth, drawHeight;
            
            if (imgAspect > canvasAspect) {
                drawWidth = canvas.width;
                drawHeight = canvas.width / imgAspect;
            } else {
                drawHeight = canvas.height;
                drawWidth = canvas.height * imgAspect;
            }
            
            ctx.drawImage(img, 
                -drawWidth/2, -drawHeight/2, 
                drawWidth, drawHeight
            );
            ctx.restore();

            // Create download link
            const link = document.createElement('a');
            link.download = `passport-photo-${selectedSize}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = originalImage;
    });

    // Download 6 photos grid functionality
    const download6Btn = document.getElementById('download6');
    
    download6Btn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Get selected size for individual photos
        const selectedSize = sizeSelect.value;
        let individualWidth, individualHeight;
        
        switch(selectedSize) {
            case '35x45':
                individualWidth = 413; // 35mm at 300dpi
                individualHeight = 531; // 45mm at 300dpi
                break;
            case '2x2':
                individualWidth = 600; // 2 inches at 300dpi
                individualHeight = 600; // 2 inches at 300dpi
                break;
            case '33x48':
                individualWidth = 390; // 33mm at 300dpi
                individualHeight = 567; // 48mm at 300dpi
                break;
            default:
                individualWidth = 413;
                individualHeight = 531;
        }
        
        // Calculate grid dimensions (2x3 layout)
        const gridCols = 3;
        const gridRows = 2;
        const spacing = 20; // Space between photos
        const margin = 40; // Margin around the grid
        
        canvas.width = (individualWidth * gridCols) + (spacing * (gridCols - 1)) + (margin * 2);
        canvas.height = (individualHeight * gridRows) + (spacing * (gridRows - 1)) + (margin * 2);

        // Set background color
        const colors = {
            white: '#ffffff',
            blue: '#3498db',
            red: '#e74c3c',
            green: '#27ae60',
            gray: '#95a5a6',
            cream: '#f4e4bc',
            transparent: '#ffffff'
        };
        
        // Handle custom color
        let bgColor;
        if (currentBg === 'custom' && customBgColor) {
            bgColor = customBgColor.value;
        } else if (currentBg === 'transparent') {
            // Create transparent background pattern
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = 20;
            patternCanvas.height = 20;
            const patternCtx = patternCanvas.getContext('2d');
            
            patternCtx.fillStyle = '#cccccc';
            patternCtx.fillRect(0, 0, 10, 10);
            patternCtx.fillRect(10, 10, 10, 10);
            patternCtx.fillStyle = '#ffffff';
            patternCtx.fillRect(10, 0, 10, 10);
            patternCtx.fillRect(0, 10, 10, 10);
            
            const pattern = ctx.createPattern(patternCanvas, 'repeat');
            ctx.fillStyle = pattern;
        } else {
            bgColor = colors[currentBg];
            ctx.fillStyle = bgColor;
        }
        
        if (currentBg !== 'transparent') {
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw the image with current transformations for each position
        const img = new Image();
        img.onload = () => {
            // Calculate dimensions to fit individual photo
            const imgAspect = img.width / img.height;
            const individualAspect = individualWidth / individualHeight;
            let drawWidth, drawHeight;
            
            if (imgAspect > individualAspect) {
                drawWidth = individualWidth;
                drawHeight = individualWidth / imgAspect;
            } else {
                drawHeight = individualHeight;
                drawWidth = individualHeight * imgAspect;
            }
            
            // Draw 6 photos in 2x3 grid
            for (let row = 0; row < gridRows; row++) {
                for (let col = 0; col < gridCols; col++) {
                    const x = margin + (col * (individualWidth + spacing));
                    const y = margin + (row * (individualHeight + spacing));
                    
                    // Save context state
                    ctx.save();
                    
                    // Translate to center of individual photo area
                    ctx.translate(x + individualWidth/2, y + individualHeight/2);
                    
                    // Apply rotation
                    ctx.rotate(rotation * Math.PI/180);
                    
                    // Apply scale
                    ctx.scale(scale, scale);
                    
                    // Draw the image centered
                    ctx.drawImage(img, 
                        -drawWidth/2, -drawHeight/2, 
                        drawWidth, drawHeight
                    );
                    
                    // Restore context state
                    ctx.restore();
                }
            }

            // Create download link
            const link = document.createElement('a');
            link.download = `passport-photo-${selectedSize}-6grid.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = originalImage;
    });

    // Background removal functionality
    const removeBgBtn = document.getElementById('removeBgBtn');
    
    removeBgBtn.addEventListener('click', removeBackground);





    // Background removal functionality
    function removeBackground() {
        if (!originalImage) return;
        
        // Show loading state
        removeBgBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        removeBgBtn.disabled = true;
        
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Simple background removal using color similarity
            // This is a basic implementation - for production, consider using AI services
            removeBackgroundSimple(data, canvas.width, canvas.height);
            
            // Put modified data back
            ctx.putImageData(imageData, 0, 0);
            
            // Update image
            const newImageData = canvas.toDataURL();
            originalImage = newImageData;
            previewImage.src = originalImage;
            
            // Reset button state
            removeBgBtn.innerHTML = '<i class="fas fa-magic"></i> Remove Background';
            removeBgBtn.disabled = false;
            
            alert('Background removed! You can now change the background color.');
        };
        
        img.src = originalImage;
    }

    function removeBackgroundSimple(data, width, height) {
        // Sample color from corners (likely background)
        const cornerSamples = [
            getPixelColor(data, 0, 0, width), // top-left
            getPixelColor(data, width-1, 0, width), // top-right
            getPixelColor(data, 0, height-1, width), // bottom-left
            getPixelColor(data, width-1, height-1, width) // bottom-right
        ];
        
        // Calculate average background color
        const bgColor = averageColor(cornerSamples);
        
        // Create edge detection mask
        const edgeMask = detectEdges(data, width, height);
        
        // Remove similar colors with edge preservation
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Check if color is similar to background
            const similarity = colorSimilarity({r, g, b}, bgColor);
            
            // Don't remove if it's an edge (to preserve subject details)
            const isEdge = edgeMask[y * width + x] > 100;
            
            // Enhanced removal criteria
            if (similarity > 0.85 && !isEdge) {
                // Make transparent
                data[i + 3] = 0; // alpha channel
            } else if (similarity > 0.7 && !isEdge) {
                // Partial transparency for similar colors
                data[i + 3] = Math.round((1 - similarity) * 255);
            }
        }
        
        // Apply feathering for smoother edges
        applyFeathering(data, width, height, 3);
    }
    
    function detectEdges(data, width, height) {
        const sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        
        const sobelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
        
        const edgeMask = new Array(width * height);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        
                        gx += gray * sobelX[ky + 1][kx + 1];
                        gy += gray * sobelY[ky + 1][kx + 1];
                    }
                }
                
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                edgeMask[y * width + x] = magnitude;
            }
        }
        
        return edgeMask;
    }
    
    function applyFeathering(data, width, height, radius) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                if (data[idx + 3] === 0) continue; // Skip transparent pixels
                
                let totalAlpha = 0;
                let count = 0;
                
                // Sample surrounding pixels
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;
                        
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            const nIdx = (ny * width + nx) * 4;
                            totalAlpha += data[nIdx + 3];
                            count++;
                        }
                    }
                }
                
                const avgAlpha = totalAlpha / count;
                // Smooth the alpha channel
                data[idx + 3] = Math.round(data[idx + 3] * 0.7 + avgAlpha * 0.3);
            }
        }
    }

    function getPixelColor(data, x, y, width) {
        const index = (y * width + x) * 4;
        return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2]
        };
    }

    function averageColor(colors) {
        const sum = colors.reduce((acc, color) => ({
            r: acc.r + color.r,
            g: acc.g + color.g,
            b: acc.b + color.b
        }), {r: 0, g: 0, b: 0});
        
        return {
            r: Math.round(sum.r / colors.length),
            g: Math.round(sum.g / colors.length),
            b: Math.round(sum.b / colors.length)
        };
    }

    function colorSimilarity(color1, color2) {
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        
        const distance = Math.sqrt(dr*dr + dg*dg + db*db);
        const maxDistance = Math.sqrt(3 * 255 * 255);
        
        return 1 - (distance / maxDistance);
    }
});