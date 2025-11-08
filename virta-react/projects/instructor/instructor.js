// Ripple Background Effect
class RippleBackground {
    constructor(containerId, cellSize = 56) {
        this.container = document.getElementById(containerId);
        this.cellSize = cellSize;
        this.clickedCell = null;
        this.rippleKey = 0;
        this.calculateGridSize();
        this.init();
    }

    calculateGridSize() {
        // Calculate rows and cols to cover full viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        this.cols = Math.ceil(viewportWidth / this.cellSize) + 2; // Add extra columns for overflow
        this.rows = Math.ceil(viewportHeight / this.cellSize) + 2; // Add extra rows for overflow
    }

    init() {
        this.createGrid();
        // Recalculate on window resize
        window.addEventListener('resize', () => {
            this.calculateGridSize();
            if (this.grid) {
                this.grid.remove();
            }
            this.createGrid();
        });
    }

    createGrid() {
        const grid = document.createElement('div');
        grid.className = 'ripple-grid';
        grid.id = 'ripple-grid';
        grid.style.gridTemplateColumns = `repeat(${this.cols}, ${this.cellSize}px)`;
        grid.style.gridTemplateRows = `repeat(${this.rows}, ${this.cellSize}px)`;

        for (let i = 0; i < this.rows * this.cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'ripple-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.handleCellClick(i));
            grid.appendChild(cell);
        }

        this.container.appendChild(grid);
        this.grid = grid;
    }

    handleCellClick(index) {
        const rowIdx = Math.floor(index / this.cols);
        const colIdx = index % this.cols;
        
        this.clickedCell = { row: rowIdx, col: colIdx };
        this.rippleKey++;
        
        // Remove previous animations
        const cells = this.grid.querySelectorAll('.ripple-cell');
        cells.forEach(cell => {
            cell.classList.remove('ripple-animate');
        });

        // Calculate and apply ripple effect
        cells.forEach((cell, idx) => {
            const cellRow = Math.floor(idx / this.cols);
            const cellCol = idx % this.cols;
            const distance = Math.hypot(
                this.clickedCell.row - cellRow,
                this.clickedCell.col - cellCol
            );
            
            const delay = Math.max(0, distance * 55);
            const duration = 200 + distance * 80;

            cell.style.setProperty('--delay', `${delay}ms`);
            cell.style.setProperty('--duration', `${duration}ms`);
            cell.classList.add('ripple-animate');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize ripple background
    new RippleBackground('ripple-background');
    
    // Add button click handlers
    const editBtn = document.querySelector('.primary-btn');
    const shareBtn = document.querySelector('.secondary-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            alert('Edit Profile functionality coming soon!');
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            // Download profile functionality
            alert('Download Profile functionality coming soon!');
        });
    }
});

