// Global state
let showOptions = false;
let twoTouchStartY = null;
let twoTouchStartTime = null;
let lastWheelTime = 0;
let wheelDeltaSum = 0;
let wheelTimeout = null;

const SWIPE_THRESHOLD = 80;
const WHEEL_THRESHOLD = 100;

// DOM Elements
const waitingState = document.getElementById('waitingState');
const backdrop = document.getElementById('backdrop');
const loginCards = document.getElementById('loginCards');
const backgroundRipple = document.getElementById('backgroundRipple');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initBackgroundRipple();
    initSwipeDetection();
});

// Background Ripple Effect
function initBackgroundRipple() {
    const rows = 8;
    const cols = 27;
    const cellSize = 56;
    
    const grid = document.createElement('div');
    grid.className = 'ripple-grid';
    
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.className = 'ripple-cell';
        cell.dataset.row = Math.floor(i / cols);
        cell.dataset.col = i % cols;
        
        cell.addEventListener('click', () => {
            animateRipple(parseInt(cell.dataset.row), parseInt(cell.dataset.col), rows, cols);
        });
        
        grid.appendChild(cell);
    }
    
    backgroundRipple.appendChild(grid);
}

function animateRipple(clickedRow, clickedCol, rows, cols) {
    const cells = document.querySelectorAll('.ripple-cell');
    
    cells.forEach((cell) => {
        const rowIdx = parseInt(cell.dataset.row);
        const colIdx = parseInt(cell.dataset.col);
        const distance = Math.hypot(clickedRow - rowIdx, clickedCol - colIdx);
        const delay = Math.max(0, distance * 55);
        const duration = 200 + distance * 80;
        
        cell.style.setProperty('--delay', `${delay}ms`);
        cell.style.setProperty('--duration', `${duration}ms`);
        cell.classList.add('animate-ripple');
        
        setTimeout(() => {
            cell.classList.remove('animate-ripple');
        }, delay + duration);
    });
}

// Two-finger swipe detection
function initSwipeDetection() {
    // Touch events for mobile
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Wheel events for trackpad
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    // Backdrop click to close
    backdrop.addEventListener('click', () => {
        hideOptions();
    });
}

function handleTouchStart(e) {
    if (showOptions) return;
    
    if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const avgY = (touch1.clientY + touch2.clientY) / 2;
        twoTouchStartY = avgY;
        twoTouchStartTime = Date.now();
    }
}

function handleTouchMove(e) {
    if (showOptions || twoTouchStartY === null) return;
    
    if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const avgY = (touch1.clientY + touch2.clientY) / 2;
        const deltaY = twoTouchStartY - avgY; // Positive = upward swipe
        
        if (deltaY > SWIPE_THRESHOLD) {
            showLoginOptions();
            twoTouchStartY = null;
            twoTouchStartTime = null;
        }
    }
}

function handleTouchEnd() {
    twoTouchStartY = null;
    twoTouchStartTime = null;
}

function handleWheel(e) {
    if (showOptions) return;
    
    // Check if it's a trackpad gesture (deltaMode === 0)
    // For swipe UP, we need deltaY > 0
    if (e.deltaMode === 0 && e.deltaY > 0) {
        const now = Date.now();
        
        // Reset if too much time has passed
        if (now - lastWheelTime > 300) {
            wheelDeltaSum = 0;
        }
        
        lastWheelTime = now;
        wheelDeltaSum += e.deltaY;
        
        // Clear existing timeout
        if (wheelTimeout) {
            clearTimeout(wheelTimeout);
        }
        
        // Check if threshold is reached
        if (wheelDeltaSum > WHEEL_THRESHOLD) {
            showLoginOptions();
            wheelDeltaSum = 0;
        } else {
            // Reset after a short delay if no more wheel events
            wheelTimeout = setTimeout(() => {
                wheelDeltaSum = 0;
            }, 200);
        }
    }
}

function showLoginOptions() {
    if (showOptions) return; // Prevent double trigger
    
    showOptions = true;
    waitingState.classList.add('hidden');
    backdrop.classList.remove('hidden');
    loginCards.classList.remove('hidden');
    
    // Trigger backdrop and cards animation
    requestAnimationFrame(() => {
        backdrop.classList.add('show');
        loginCards.classList.add('show');
    });
}

function hideOptions() {
    if (!showOptions) return; // Prevent double trigger
    
    showOptions = false;
    backdrop.classList.remove('show');
    loginCards.classList.remove('show');
    
    setTimeout(() => {
        backdrop.classList.add('hidden');
        loginCards.classList.add('hidden');
        waitingState.classList.remove('hidden');
    }, 300);
}

