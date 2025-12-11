// Game Configuration - Optimized for Desktop
const CONFIG = {
    CELL_SIZE: 50, // Increased for better desktop visibility
    WALL_WIDTH: 4, // Thicker walls for desktop
    FLASHLIGHT_RADIUS: 120, // Larger flashlight radius for desktop
    FLASHLIGHT_DURATION: 10, // seconds
    PLAYER_RADIUS: 12, // Slightly larger player
    PLAYER_VISION_RADIUS: 70, // Larger vision radius for desktop
    PLAYER_SPEED: 4.5, // Optimized for desktop movement
    MAZE_COLS: 13, // Adjusted for better desktop aspect ratio
    MAZE_ROWS: 9, // Adjusted for better desktop aspect ratio
    MAX_LIVES: 3,
    MAX_FLASHLIGHTS: 3
};

// Game State
const gameState = {
    phase: 'start', // 'start', 'flashlight', 'movement', 'failure', 'success'
    lives: CONFIG.MAX_LIVES,
    flashlightsRemaining: CONFIG.MAX_FLASHLIGHTS,
    currentFlashlightTime: CONFIG.FLASHLIGHT_DURATION,
    maze: null,
    player: { x: 0, y: 0 },
    goal: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    revealedCells: new Set(),
    timerInterval: null,
    mazeOffsetX: 0,
    mazeOffsetY: 0
};

// Canvas and Context
let canvas, ctx;

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Event listeners
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', resetGame);
    document.getElementById('playAgainBtn').addEventListener('click', resetGame);
    document.getElementById('homeIcon').addEventListener('click', goHome);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    // Track mouse position
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        gameState.mousePos.x = e.clientX - rect.left;
        gameState.mousePos.y = e.clientY - rect.top;
    });
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Recalculate maze offset if game is in progress
    if (gameState.maze && gameState.phase !== 'start') {
        const mazeWidth = CONFIG.MAZE_COLS * CONFIG.CELL_SIZE;
        const mazeHeight = CONFIG.MAZE_ROWS * CONFIG.CELL_SIZE;
        const oldOffsetX = gameState.mazeOffsetX;
        const oldOffsetY = gameState.mazeOffsetY;

        gameState.mazeOffsetX = (canvas.width - mazeWidth) / 2;
        gameState.mazeOffsetY = (canvas.height - mazeHeight) / 2;

        // Adjust player and goal positions by the offset difference
        const deltaX = gameState.mazeOffsetX - oldOffsetX;
        const deltaY = gameState.mazeOffsetY - oldOffsetY;

        gameState.player.x += deltaX;
        gameState.player.y += deltaY;
        gameState.goal.x += deltaX;
        gameState.goal.y += deltaY;
    }
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goHome() {
    resetGame();
    showScreen('startScreen');
}

// Maze Generation using Recursive Backtracking
function generateMaze() {
    const cols = CONFIG.MAZE_COLS;
    const rows = CONFIG.MAZE_ROWS;

    // Initialize grid
    const maze = Array(rows).fill(null).map(() =>
        Array(cols).fill(null).map(() => ({
            top: true,
            right: true,
            bottom: true,
            left: true,
            visited: false,
            onCorrectPath: false,
            isDeadEnd: false
        }))
    );

    // Recursive backtracking to create paths
    const stack = [];
    // Start from bottom-left corner
    let current = { row: rows - 1, col: 0 };
    maze[rows - 1][0].visited = true;
    let visitedCount = 1;
    const totalCells = rows * cols;

    // Store the path from start to end for the correct route
    const correctPath = [];
    correctPath.push({ row: rows - 1, col: 0 });

    while (visitedCount < totalCells) {
        const neighbors = getUnvisitedNeighbors(current, maze, rows, cols);

        if (neighbors.length > 0) {
            // Choose random neighbor
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];

            // Remove wall between current and next
            removeWall(current, next, maze);

            stack.push(current);
            maze[next.row][next.col].visited = true;
            current = next;
            visitedCount++;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            // Find unvisited cell
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (!maze[r][c].visited) {
                        current = { row: r, col: c };
                        maze[r][c].visited = true;
                        visitedCount++;
                        break;
                    }
                }
                if (!maze[current.row][current.col].visited) break;
            }
        }
    }

    // Mark the correct path from start to goal
    markCorrectPath(maze, rows, cols);

    // Add some dead ends by creating additional branches
    addDeadEnds(maze, rows, cols);

    return maze;
}

function getUnvisitedNeighbors(cell, maze, rows, cols) {
    const neighbors = [];
    const { row, col } = cell;

    // Top
    if (row > 0 && !maze[row - 1][col].visited) {
        neighbors.push({ row: row - 1, col, direction: 'top' });
    }
    // Right
    if (col < cols - 1 && !maze[row][col + 1].visited) {
        neighbors.push({ row, col: col + 1, direction: 'right' });
    }
    // Bottom
    if (row < rows - 1 && !maze[row + 1][col].visited) {
        neighbors.push({ row: row + 1, col, direction: 'bottom' });
    }
    // Left
    if (col > 0 && !maze[row][col - 1].visited) {
        neighbors.push({ row, col: col - 1, direction: 'left' });
    }

    return neighbors;
}

function removeWall(current, next, maze) {
    const rowDiff = current.row - next.row;
    const colDiff = current.col - next.col;

    if (rowDiff === 1) { // Next is above current
        maze[current.row][current.col].top = false;
        maze[next.row][next.col].bottom = false;
    } else if (rowDiff === -1) { // Next is below current
        maze[current.row][current.col].bottom = false;
        maze[next.row][next.col].top = false;
    } else if (colDiff === 1) { // Next is left of current
        maze[current.row][current.col].left = false;
        maze[next.row][next.col].right = false;
    } else if (colDiff === -1) { // Next is right of current
        maze[current.row][current.col].right = false;
        maze[next.row][next.col].left = false;
    }
}

function markCorrectPath(maze, rows, cols) {
    // Use BFS to find path from bottom-left (rows-1, 0) to top-right (0, cols-1)
    const start = { row: rows - 1, col: 0 };
    const end = { row: 0, col: cols - 1 };

    const queue = [start];
    const visited = new Set();
    const parent = new Map();
    visited.add(`${start.row},${start.col}`);

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.row === end.row && current.col === end.col) {
            // Reconstruct path
            let cell = current;
            while (cell) {
                maze[cell.row][cell.col].onCorrectPath = true;
                const key = `${cell.row},${cell.col}`;
                cell = parent.get(key);
            }
            break;
        }

        // Check neighbors
        const neighbors = getAccessibleNeighbors(current, maze, rows, cols);
        for (const neighbor of neighbors) {
            const key = `${neighbor.row},${neighbor.col}`;
            if (!visited.has(key)) {
                visited.add(key);
                parent.set(key, current);
                queue.push(neighbor);
            }
        }
    }
}

function getAccessibleNeighbors(cell, maze, rows, cols) {
    const neighbors = [];
    const { row, col } = cell;
    const currentCell = maze[row][col];

    // Top
    if (row > 0 && !currentCell.top) {
        neighbors.push({ row: row - 1, col });
    }
    // Right
    if (col < cols - 1 && !currentCell.right) {
        neighbors.push({ row, col: col + 1 });
    }
    // Bottom
    if (row < rows - 1 && !currentCell.bottom) {
        neighbors.push({ row: row + 1, col });
    }
    // Left
    if (col > 0 && !currentCell.left) {
        neighbors.push({ row, col: col - 1 });
    }

    return neighbors;
}

function addDeadEnds(maze, rows, cols) {
    // Identify cells not on the correct path and mark some as dead ends
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (!maze[row][col].onCorrectPath) {
                const neighbors = getAccessibleNeighbors({ row, col }, maze, rows, cols);
                if (neighbors.length === 1) {
                    maze[row][col].isDeadEnd = true;
                }
            }
        }
    }
}

// Game Flow
function startGame() {
    showScreen('gameScreen');
    gameState.maze = generateMaze();
    gameState.lives = CONFIG.MAX_LIVES;
    gameState.flashlightsRemaining = CONFIG.MAX_FLASHLIGHTS;

    // Calculate maze offset to center it on screen
    const mazeWidth = CONFIG.MAZE_COLS * CONFIG.CELL_SIZE;
    const mazeHeight = CONFIG.MAZE_ROWS * CONFIG.CELL_SIZE;
    gameState.mazeOffsetX = (canvas.width - mazeWidth) / 2;
    gameState.mazeOffsetY = (canvas.height - mazeHeight) / 2;

    // Set player at start position (bottom-left corner of maze)
    const startCol = 0;
    const startRow = CONFIG.MAZE_ROWS - 1;
    const startX = gameState.mazeOffsetX + startCol * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const startY = gameState.mazeOffsetY + startRow * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    gameState.player = { x: startX, y: startY };

    // Set goal at end position (top-right corner of maze)
    const goalCol = CONFIG.MAZE_COLS - 1;
    const goalRow = 0;
    gameState.goal = {
        x: gameState.mazeOffsetX + goalCol * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
        y: gameState.mazeOffsetY + goalRow * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2
    };

    updateHUD();
    startFlashlightPhase();
}

function startFlashlightPhase() {
    gameState.phase = 'flashlight';
    gameState.currentFlashlightTime = CONFIG.FLASHLIGHT_DURATION;
    gameState.revealedCells = new Set();

    // Start timer
    updateTimer();
    gameState.timerInterval = setInterval(() => {
        gameState.currentFlashlightTime--;
        updateTimer();

        if (gameState.currentFlashlightTime <= 0) {
            endFlashlightPhase();
        }
    }, 1000);

    // Start render loop
    requestAnimationFrame(gameLoop);
}

function endFlashlightPhase() {
    clearInterval(gameState.timerInterval);
    gameState.flashlightsRemaining--;
    updateHUD();

    // Transition to movement phase
    startMovementPhase();
}

function startMovementPhase() {
    gameState.phase = 'movement';
    requestAnimationFrame(gameLoop);
}

function resetToFlashlight() {
    if (gameState.flashlightsRemaining > 0) {
        startFlashlightPhase();
    } else {
        // No flashlights left, go straight to movement
        startMovementPhase();
    }
}

function handleWrongPath() {
    gameState.lives--;
    updateHUD();

    if (gameState.lives <= 0) {
        // Game over
        gameState.phase = 'failure';
        showScreen('failureScreen');
    } else {
        // Show message and reset to flashlight phase
        showMessage("You take the wrong way", () => {
            // Reset player position to bottom-left corner
            const startCol = 0;
            const startRow = CONFIG.MAZE_ROWS - 1;
            gameState.player = {
                x: gameState.mazeOffsetX + startCol * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                y: gameState.mazeOffsetY + startRow * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2
            };
            resetToFlashlight();
        });
    }
}

function handleSuccess() {
    gameState.phase = 'success';
    showScreen('successScreen');
}

function showMessage(text, callback) {
    const overlay = document.getElementById('messageOverlay');
    const messageText = document.getElementById('messageText');

    messageText.textContent = text;
    overlay.classList.add('active');

    setTimeout(() => {
        overlay.classList.remove('active');
        if (callback) callback();
    }, 2000);
}

// Player Movement
function handleMouseMove(e) {
    // Just update mouse position, actual movement happens in updatePlayerMovement
}

function updatePlayerMovement() {
    if (gameState.phase !== 'movement') return;

    // Calculate direction to mouse
    const dx = gameState.mousePos.x - gameState.player.x;
    const dy = gameState.mousePos.y - gameState.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
        // Normalize and move
        const moveX = (dx / distance) * CONFIG.PLAYER_SPEED;
        const moveY = (dy / distance) * CONFIG.PLAYER_SPEED;

        // Check collision before moving
        const newX = gameState.player.x + moveX;
        const newY = gameState.player.y + moveY;

        if (canMoveTo(newX, newY)) {
            gameState.player.x = newX;
            gameState.player.y = newY;

            // Check if reached goal
            const goalDist = Math.sqrt(
                Math.pow(gameState.player.x - gameState.goal.x, 2) +
                Math.pow(gameState.player.y - gameState.goal.y, 2)
            );

            if (goalDist < 20) {
                handleSuccess();
                return;
            }

            // Check if in dead end
            const playerCell = {
                row: Math.floor((gameState.player.y - gameState.mazeOffsetY) / CONFIG.CELL_SIZE),
                col: Math.floor((gameState.player.x - gameState.mazeOffsetX) / CONFIG.CELL_SIZE)
            };

            if (playerCell.row >= 0 && playerCell.row < CONFIG.MAZE_ROWS &&
                playerCell.col >= 0 && playerCell.col < CONFIG.MAZE_COLS) {

                const cell = gameState.maze[playerCell.row][playerCell.col];
                if (cell.isDeadEnd && !cell.onCorrectPath) {
                    handleWrongPath();
                }
            }
        }
    }
}

function handleCanvasClick(e) {
    // Only used for dismissing messages in some implementations
}

function canMoveTo(x, y) {
    const cellCol = Math.floor((x - gameState.mazeOffsetX) / CONFIG.CELL_SIZE);
    const cellRow = Math.floor((y - gameState.mazeOffsetY) / CONFIG.CELL_SIZE);

    // Check bounds
    if (cellRow < 0 || cellRow >= CONFIG.MAZE_ROWS ||
        cellCol < 0 || cellCol >= CONFIG.MAZE_COLS) {
        return false;
    }

    const cell = gameState.maze[cellRow][cellCol];

    // Check wall collisions
    const cellX = gameState.mazeOffsetX + cellCol * CONFIG.CELL_SIZE;
    const cellY = gameState.mazeOffsetY + cellRow * CONFIG.CELL_SIZE;
    const margin = CONFIG.PLAYER_RADIUS;

    // Top wall
    if (cell.top && y - margin < cellY) return false;
    // Bottom wall
    if (cell.bottom && y + margin > cellY + CONFIG.CELL_SIZE) return false;
    // Left wall
    if (cell.left && x - margin < cellX) return false;
    // Right wall
    if (cell.right && x + margin > cellX + CONFIG.CELL_SIZE) return false;

    return true;
}

// Rendering
function gameLoop() {
    if (gameState.phase === 'flashlight') {
        renderFlashlightPhase();
        requestAnimationFrame(gameLoop);
    } else if (gameState.phase === 'movement') {
        updatePlayerMovement();
        renderMovementPhase();
        requestAnimationFrame(gameLoop);
    }
}

function renderFlashlightPhase() {
    // Clear canvas with black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw starting position (player icon) - always visible
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('🚶', gameState.player.x - 10, gameState.player.y + 7);
    ctx.restore();

    // Draw goal (house icon) - always visible
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('🏠', gameState.goal.x - 12, gameState.goal.y + 8);
    ctx.restore();

    // Create circular clipping region for flashlight
    ctx.save();
    ctx.beginPath();
    ctx.arc(gameState.mousePos.x, gameState.mousePos.y, CONFIG.FLASHLIGHT_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // Draw maze only in flashlight area
    drawMaze();

    ctx.restore();

    // Add flashlight glow effect
    const gradient = ctx.createRadialGradient(
        gameState.mousePos.x, gameState.mousePos.y, 0,
        gameState.mousePos.x, gameState.mousePos.y, CONFIG.FLASHLIGHT_RADIUS
    );
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function renderMovementPhase() {
    // Clear canvas with black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create circular clipping region around player
    ctx.save();
    ctx.beginPath();
    ctx.arc(gameState.player.x, gameState.player.y, CONFIG.PLAYER_VISION_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // Draw maze only in vision area
    drawMaze();

    // Draw goal if visible
    const goalDist = Math.sqrt(
        Math.pow(gameState.player.x - gameState.goal.x, 2) +
        Math.pow(gameState.player.y - gameState.goal.y, 2)
    );

    if (goalDist < CONFIG.PLAYER_VISION_RADIUS) {
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText('🏠', gameState.goal.x - 12, gameState.goal.y + 8);
    }

    ctx.restore();

    // Draw player
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(gameState.player.x, gameState.player.y, CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Add vision glow effect
    const gradient = ctx.createRadialGradient(
        gameState.player.x, gameState.player.y, 0,
        gameState.player.x, gameState.player.y, CONFIG.PLAYER_VISION_RADIUS
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMaze() {
    if (!gameState.maze) return;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = CONFIG.WALL_WIDTH;

    for (let row = 0; row < CONFIG.MAZE_ROWS; row++) {
        for (let col = 0; col < CONFIG.MAZE_COLS; col++) {
            const cell = gameState.maze[row][col];
            const x = gameState.mazeOffsetX + col * CONFIG.CELL_SIZE;
            const y = gameState.mazeOffsetY + row * CONFIG.CELL_SIZE;

            // Draw walls
            ctx.beginPath();

            if (cell.top) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + CONFIG.CELL_SIZE, y);
            }

            if (cell.right) {
                ctx.moveTo(x + CONFIG.CELL_SIZE, y);
                ctx.lineTo(x + CONFIG.CELL_SIZE, y + CONFIG.CELL_SIZE);
            }

            if (cell.bottom) {
                ctx.moveTo(x, y + CONFIG.CELL_SIZE);
                ctx.lineTo(x + CONFIG.CELL_SIZE, y + CONFIG.CELL_SIZE);
            }

            if (cell.left) {
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + CONFIG.CELL_SIZE);
            }

            ctx.stroke();
        }
    }
}

// HUD Updates
function updateHUD() {
    // Update lives
    for (let i = 1; i <= CONFIG.MAX_LIVES; i++) {
        const heart = document.querySelector(`[data-life="${i}"]`);
        if (i <= gameState.lives) {
            heart.classList.remove('empty');
            heart.classList.add('filled');
        } else {
            heart.classList.remove('filled');
            heart.classList.add('empty');
        }
    }

    // Update flashlights
    for (let i = 1; i <= CONFIG.MAX_FLASHLIGHTS; i++) {
        const flashlight = document.querySelector(`[data-flashlight="${i}"]`);
        if (i <= gameState.flashlightsRemaining) {
            flashlight.classList.remove('used');
        } else {
            flashlight.classList.add('used');
        }
    }
}

function updateTimer() {
    const seconds = gameState.currentFlashlightTime.toString().padStart(2, '0');
    document.getElementById('timerSeconds').textContent = seconds;
}

// Reset Game
function resetGame() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.phase = 'start';
    gameState.lives = CONFIG.MAX_LIVES;
    gameState.flashlightsRemaining = CONFIG.MAX_FLASHLIGHTS;
    gameState.maze = null;

    startGame();
}
