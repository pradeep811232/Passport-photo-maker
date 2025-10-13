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
    const cropBtn = document.getElementById('cropBtn');
    const cropApply = document.getElementById('cropApply');
    const cropCancel = document.getElementById('cropCancel');
    const cropContainer = document.getElementById('cropContainer');
    const cropBox = document.getElementById('cropBox');

    // Check if all elements exist before adding event listeners
    if (!uploadBox || !fileInput || !editorSection || !previewImage || 
        !rotateLeftBtn || !rotateRightBtn || !zoomInBtn || !zoomOutBtn || 
        !downloadBtn || !resetBtn || !zoomLevel || !sizeSelect) {
        console.error('Some required elements are missing from the DOM');
        return;
    }

    let rotation = 0;
    let scale = 1;
    let currentBg = 'white';
    let originalImage = null;
    let isCropping = false;
    let cropData = null;
    let isDragging = false;
    let isResizing = false;
    let dragStart = { x: 0, y: 0 };
    let cropStart = { x: 0, y: 0, width: 0, height: 0 };

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

    function updateBgButtons() {
        bgButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.bg === currentBg) {
                btn.classList.add('active');
            }
        });
    }

    function updateBackground() {
        const previewContainer = document.querySelector('.preview-container');
        const colors = {
            white: '#ffffff',
            blue: '#3498db',
            red: '#e74c3c'
        };
        previewContainer.style.backgroundColor = colors[currentBg];
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
            red: '#e74c3c'
        };
        ctx.fillStyle = colors[currentBg];
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

    // Initialize background buttons
    updateBgButtons();

    // Background removal functionality
    const removeBgBtn = document.getElementById('removeBgBtn');
    
    removeBgBtn.addEventListener('click', removeBackground);

    // Crop functionality
    cropBtn.addEventListener('click', startCrop);
    cropApply.addEventListener('click', applyCrop);
    cropCancel.addEventListener('click', cancelCrop);

    function startCrop() {
        if (!originalImage) return;
        
        isCropping = true;
        cropContainer.style.display = 'block';
        cropBtn.style.display = 'none';
        cropApply.style.display = 'inline-block';
        cropCancel.style.display = 'inline-block';
        
        // Initialize crop box
        const img = previewImage;
        const imgRect = img.getBoundingClientRect();
        const containerRect = cropContainer.getBoundingClientRect();
        
        // Set initial crop box size (80% of image size)
        const cropWidth = imgRect.width * 0.8;
        const cropHeight = imgRect.height * 0.8;
        const cropLeft = (imgRect.width - cropWidth) / 2;
        const cropTop = (imgRect.height - cropHeight) / 2;
        
        cropBox.style.left = cropLeft + 'px';
        cropBox.style.top = cropTop + 'px';
        cropBox.style.width = cropWidth + 'px';
        cropBox.style.height = cropHeight + 'px';
        
        // Add resize handles
        addResizeHandles();
        
        // Add event listeners for dragging and resizing
        cropBox.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    function addResizeHandles() {
        // Remove existing handles
        const existingHandles = cropBox.querySelectorAll('.resize-handle');
        existingHandles.forEach(handle => handle.remove());
        
        // Add new handles
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position}`;
            handle.addEventListener('mousedown', (e) => startResize(e, position));
            cropBox.appendChild(handle);
        });
    }

    function startDrag(e) {
        if (e.target.classList.contains('resize-handle')) return;
        
        isDragging = true;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        
        const rect = cropBox.getBoundingClientRect();
        const containerRect = cropContainer.getBoundingClientRect();
        cropStart.x = rect.left - containerRect.left;
        cropStart.y = rect.top - containerRect.top;
        
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        let newLeft = cropStart.x + deltaX;
        let newTop = cropStart.y + deltaY;
        
        // Keep crop box within image bounds
        const containerRect = cropContainer.getBoundingClientRect();
        const maxLeft = containerRect.width - cropBox.offsetWidth;
        const maxTop = containerRect.height - cropBox.offsetHeight;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        cropBox.style.left = newLeft + 'px';
        cropBox.style.top = newTop + 'px';
    }

    function stopDrag() {
        isDragging = false;
    }

    function startResize(e, position) {
        isResizing = true;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        
        const rect = cropBox.getBoundingClientRect();
        cropStart.width = rect.width;
        cropStart.height = rect.height;
        cropStart.x = rect.left;
        cropStart.y = rect.top;
        
        cropBox.dataset.resizePosition = position;
        e.preventDefault();
        e.stopPropagation();
    }

    function applyCrop() {
        if (!isCropping) return;
        
        // Get crop coordinates
        const cropLeft = parseInt(cropBox.style.left);
        const cropTop = parseInt(cropBox.style.top);
        const cropWidth = parseInt(cropBox.style.width);
        const cropHeight = parseInt(cropBox.style.height);
        
        // Store crop data
        cropData = {
            x: cropLeft,
            y: cropTop,
            width: cropWidth,
            height: cropHeight
        };
        
        // Create cropped image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate scale factor
            const scaleX = img.naturalWidth / previewImage.naturalWidth;
            const scaleY = img.naturalHeight / previewImage.naturalHeight;
            
            canvas.width = cropWidth * scaleX;
            canvas.height = cropHeight * scaleY;
            
            ctx.drawImage(
                img,
                cropLeft * scaleX, cropTop * scaleY,
                cropWidth * scaleX, cropHeight * scaleY,
                0, 0,
                canvas.width, canvas.height
            );
            
            // Update preview with cropped image
            originalImage = canvas.toDataURL();
            previewImage.src = originalImage;
            
            // Reset crop mode
            cancelCrop();
        };
        
        img.src = originalImage;
    }

    function cancelCrop() {
        isCropping = false;
        cropContainer.style.display = 'none';
        cropBtn.style.display = 'inline-block';
        cropApply.style.display = 'none';
        cropCancel.style.display = 'none';
        
        // Remove event listeners
        cropBox.removeEventListener('mousedown', startDrag);
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    // Resize functionality
    function resize(e) {
        if (!isResizing) return;
        
        const position = cropBox.dataset.resizePosition;
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        let newWidth = cropStart.width;
        let newHeight = cropStart.height;
        let newLeft = cropStart.x;
        let newTop = cropStart.y;
        
        switch (position) {
            case 'se':
                newWidth = Math.max(50, cropStart.width + deltaX);
                newHeight = Math.max(50, cropStart.height + deltaY);
                break;
            case 'sw':
                newWidth = Math.max(50, cropStart.width - deltaX);
                newHeight = Math.max(50, cropStart.height + deltaY);
                newLeft = cropStart.x + deltaX;
                break;
            case 'ne':
                newWidth = Math.max(50, cropStart.width + deltaX);
                newHeight = Math.max(50, cropStart.height - deltaY);
                newTop = cropStart.y + deltaY;
                break;
            case 'nw':
                newWidth = Math.max(50, cropStart.width - deltaX);
                newHeight = Math.max(50, cropStart.height - deltaY);
                newLeft = cropStart.x + deltaX;
                newTop = cropStart.y + deltaY;
                break;
        }
        
        // Keep within bounds
        const containerRect = cropContainer.getBoundingClientRect();
        newWidth = Math.min(newWidth, containerRect.width - newLeft);
        newHeight = Math.min(newHeight, containerRect.height - newTop);
        newLeft = Math.max(0, newLeft);
        newTop = Math.max(0, newTop);
        
        cropBox.style.width = newWidth + 'px';
        cropBox.style.height = newHeight + 'px';
        cropBox.style.left = newLeft + 'px';
        cropBox.style.top = newTop + 'px';
    }

    function stopResize() {
        isResizing = false;
        cropBox.dataset.resizePosition = '';
    }

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
        
        // Remove similar colors
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Check if color is similar to background
            if (colorSimilarity({r, g, b}, bgColor) > 0.9) {
                // Make transparent
                data[i + 3] = 0; // alpha channel
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