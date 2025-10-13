// Test script for Passport Photo Maker
console.log('🚀 Passport Photo Maker - Testing functionality...');

// Test 1: Check if all DOM elements exist
const elements = [
    'uploadBox', 'fileInput', 'editorSection', 'previewImage',
    'rotateLeft', 'rotateRight', 'zoomIn', 'zoomOut',
    'download', 'resetBtn', 'zoomLevel', 'sizeSelect'
];

let allElementsFound = true;
elements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`❌ Element with ID '${id}' not found`);
        allElementsFound = false;
    } else {
        console.log(`✅ Element '${id}' found`);
    }
});

if (allElementsFound) {
    console.log('✅ All required DOM elements are present');
} else {
    console.error('❌ Some DOM elements are missing');
}

// Test 2: Check if background buttons exist
const bgButtons = document.querySelectorAll('.bg-btn');
console.log(`✅ Found ${bgButtons.length} background color buttons`);

// Test 3: Check if Font Awesome is loaded
if (document.querySelector('link[href*="font-awesome"]')) {
    console.log('✅ Font Awesome CSS loaded');
} else {
    console.error('❌ Font Awesome CSS not found');
}

// Test 4: Test upload functionality simulation
const uploadBox = document.getElementById('uploadBox');
if (uploadBox) {
    uploadBox.addEventListener('click', () => {
        console.log('📸 Upload box clicked - ready for file selection');
    });
    console.log('✅ Upload box event listener added');
}

// Test 5: Test editor controls
const testControls = () => {
    console.log('🎛️ Testing editor controls...');
    
    // Test zoom controls
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    
    if (zoomInBtn && zoomOutBtn) {
        console.log('✅ Zoom controls available');
        zoomInBtn.addEventListener('click', () => {
            console.log('🔍 Zoom in clicked');
        });
        zoomOutBtn.addEventListener('click', () => {
            console.log('🔍 Zoom out clicked');
        });
    }
    
    // Test rotation controls
    const rotateLeftBtn = document.getElementById('rotateLeft');
    const rotateRightBtn = document.getElementById('rotateRight');
    
    if (rotateLeftBtn && rotateRightBtn) {
        console.log('✅ Rotation controls available');
        rotateLeftBtn.addEventListener('click', () => {
            console.log('🔄 Rotate left clicked');
        });
        rotateRightBtn.addEventListener('click', () => {
            console.log('🔄 Rotate right clicked');
        });
    }
};

testControls();

console.log('🎉 Passport Photo Maker - All tests completed!');
console.log('💡 Ready to use: Upload a photo to get started!');