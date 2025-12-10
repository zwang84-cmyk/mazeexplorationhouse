// Game Configuration
const CONFIG = {
    GRID_SIZE: 15,
    CELL_SIZE: 40,
    WALL_THICKNESS: 3,
    FLASHLIGHT_RADIUS: 100,
    FLASHLIGHT_TIME: 10,
    PLAYER_RADIUS: 8,
    PLAYER_VISION_RADIUS: 60,
    PLAYER_SPEED: 3,
    LIVES: 3,
    FLASHLIGHTS: 3
};

// Game State
let gameState = {
    screen: 'start', // 'start', 'flashlight', 'movement', 'failure', 'success'
    lives: CONFIG.LIVES,
    flashlights: CONFIG.FLASHLIGHTS,
    timer: CONFIG.FLASHLIGHT_TIME,
    maze: null,
    correctPath: null,
    deadEnds: [],
    playerPos: { x: 0, y: 0 },
    goalPos: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    isMoving: false,
    hasReachedGoal: false
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elements
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const failureScreen = document.getElementById('failureScreen');
const successScreen = document.getElementById('successScreen');
const messageOverlay = document.getElementById('messageOverlay');
const messageText = document.getElementById('messageText');
const timerDisplay = document.querySelector('.timer');
const goalIcon = document.getElementById('goalIcon');

// Timer Interval
let timerInterval = null;

// Initialize
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start button event listeners
    document.querySelectorAll('.start-button').forEach(btn => {
        btn.addEventListener('click', startGame);
    });

    // Mouse tracking
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
}

function resizeCanvas() {
    const uiHeight = document.querySelector('.game-ui')?.offsetHeight || 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - uiHeight;
}

function startGame() {
    // Reset game state
    gameState.lives = CONFIG.LIVES;
    gameState.flashlights = CONFIG.FLASHLIGHTS;
    gameState.timer = CONFIG.FLASHLIGHT_TIME;
    gameState.hasReachedGoal = false;

    // Generate maze
    generateMaze();

    // Update UI
    updateUI();

    // Switch to game screen
    showScreen('game');

    // Start flashlight phase
    startFlashlightPhase();
}

function showScreen(screen) {
    startScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    failureScreen.classList.remove('active');
    successScreen.classList.remove('active');

    if (screen === 'start') {
        startScreen.classList.add('active');
    } else if (screen === 'game') {
        gameScreen.classList.add('active');
    } else if (screen === 'failure') {
        failureScreen.classList.add('active');
    } else if (screen === 'success') {
        successScreen.classList.add('active');
    }
}

// Maze Generation
function generateMaze() {
    const size = CONFIG.GRID_SIZE;

    // Initialize grid with all walls
    const maze = Array(size).fill(null).map(() =>
        Array(size).fill(null).map(() => ({
            top: true,
            right: true,
            bottom: true,
            left: true,
            visited: false,
            isPath: false,
            isDeadEnd: false
        }))
    );

    // Generate main path from start to goal using recursive backtracker
    const stack = [];
    const start = { x: 0, y: 0 };
    const goal = { x: size - 1, y: size - 1 };

    let current = start;
    maze[current.y][current.x].visited = true;

    // Create a single path to the goal
    const correctPath = [];

    while (true) {
        correctPath.push({ x: current.x, y: current.y });
        maze[current.y][current.x].isPath = true;

        // If reached goal, stop
        if (current.x === goal.x && current.y === goal.y) {
            break;
        }

        // Get neighbors closer to goal
        const neighbors = [];

        // Prefer moving right or down towards goal
        if (current.x < goal.x && current.x < size - 1) {
            const next = { x: current.x + 1, y: current.y };
            if (!maze[next.y][next.x].visited) {
                neighbors.push({ cell: next, dir: 'right' });
            }
        }

        if (current.y < goal.y && current.y < size - 1) {
            const next = { x: current.x, y: current.y + 1 };
            if (!maze[next.y][next.x].visited) {
                neighbors.push({ cell: next, dir: 'bottom' });
            }
        }

        // If no forward neighbors, allow any unvisited neighbor
        if (neighbors.length === 0) {
            const dirs = [
                { dx: 0, dy: -1, dir: 'top' },
                { dx: 1, dy: 0, dir: 'right' },
                { dx: 0, dy: 1, dir: 'bottom' },
                { dx: -1, dy: 0, dir: 'left' }
            ];

            for (const d of dirs) {
                const nx = current.x + d.dx;
                const ny = current.y + d.dy;

                if (nx >= 0 && nx < size && ny >= 0 && ny < size && !maze[ny][nx].visited) {
                    neighbors.push({ cell: { x: nx, y: ny }, dir: d.dir });
                }
            }
        }

        if (neighbors.length > 0) {
            const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(current);

            // Remove walls
            removeWall(maze, current, chosen.cell);

            current = chosen.cell;
            maze[current.y][current.x].visited = true;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }

    // Add dead-end branches
    const deadEnds = [];
    for (let i = 0; i < size * 2; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);

        if (maze[y][x].isPath) {
            // Create a dead-end branch from this path cell
            const branchLength = 2 + Math.floor(Math.random() * 4);
            createDeadEndBranch(maze, { x, y }, branchLength, deadEnds, size);
        }
    }

    gameState.maze = maze;
    gameState.correctPath = correctPath;
    gameState.deadEnds = deadEnds;
    gameState.goalPos = { x: goal.x, y: goal.y };

    // Set player starting position
    gameState.playerPos = {
        x: start.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
        y: start.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2
    };
}

function removeWall(maze, cell1, cell2) {
    const dx = cell2.x - cell1.x;
    const dy = cell2.y - cell1.y;

    if (dx === 1) {
        maze[cell1.y][cell1.x].right = false;
        maze[cell2.y][cell2.x].left = false;
    } else if (dx === -1) {
        maze[cell1.y][cell1.x].left = false;
        maze[cell2.y][cell2.x].right = false;
    } else if (dy === 1) {
        maze[cell1.y][cell1.x].bottom = false;
        maze[cell2.y][cell2.x].top = false;
    } else if (dy === -1) {
        maze[cell1.y][cell1.x].top = false;
        maze[cell2.y][cell2.x].bottom = false;
    }
}

function createDeadEndBranch(maze, start, length, deadEnds, size) {
    let current = { ...start };
    const branchCells = [];

    for (let i = 0; i < length; i++) {
        const dirs = [
            { dx: 0, dy: -1, dir: 'top' },
            { dx: 1, dy: 0, dir: 'right' },
            { dx: 0, dy: 1, dir: 'bottom' },
            { dx: -1, dy: 0, dir: 'left' }
        ];

        // Shuffle directions
        dirs.sort(() => Math.random() - 0.5);

        let moved = false;
        for (const d of dirs) {
            const nx = current.x + d.dx;
            const ny = current.y + d.dy;

            if (nx >= 0 && nx < size && ny >= 0 && ny < size &&
                !maze[ny][nx].visited && !maze[ny][nx].isPath) {

                removeWall(maze, current, { x: nx, y: ny });
                current = { x: nx, y: ny };
                maze[ny][nx].visited = true;
                maze[ny][nx].isDeadEnd = true;
                branchCells.push({ x: nx, y: ny });
                moved = true;
                break;
            }
        }

        if (!moved) break;
    }

    if (branchCells.length > 0) {
        deadEnds.push(branchCells);
    }
}

// Flashlight Phase
function startFlashlightPhase() {
    gameState.screen = 'flashlight';
    gameState.timer = CONFIG.FLASHLIGHT_TIME;
    updateTimerDisplay();

    // Start timer
    timerInterval = setInterval(() => {
        gameState.timer--;
        updateTimerDisplay();

        if (gameState.timer <= 0) {
            endFlashlightPhase();
        }
    }, 1000);

    // Start render loop
    requestAnimationFrame(renderFlashlightPhase);
}

function endFlashlightPhase() {
    clearInterval(timerInterval);
    gameState.flashlights--;
    updateUI();

    // Show message
    showMessage("You take the right way!");

    setTimeout(() => {
        hideMessage();
        startMovementPhase();
    }, 2000);
}

function renderFlashlightPhase() {
    if (gameState.screen !== 'flashlight') return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill entire canvas black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create flashlight effect
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const offsetX = centerX - (CONFIG.GRID_SIZE * CONFIG.CELL_SIZE) / 2;
    const offsetY = centerY - (CONFIG.GRID_SIZE * CONFIG.CELL_SIZE) / 2;

    // Save context
    ctx.save();

    // Create circular clipping path for flashlight
    ctx.beginPath();
    ctx.arc(gameState.mousePos.x, gameState.mousePos.y, CONFIG.FLASHLIGHT_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // Draw maze within flashlight
    drawMaze(offsetX, offsetY);

    // Restore context
    ctx.restore();

    // Draw flashlight gradient border
    const gradient = ctx.createRadialGradient(
        gameState.mousePos.x, gameState.mousePos.y, CONFIG.FLASHLIGHT_RADIUS - 20,
        gameState.mousePos.x, gameState.mousePos.y, CONFIG.FLASHLIGHT_RADIUS
    );
    gradient.addColorStop(0, 'rgba(245, 245, 220, 0)');
    gradient.addColorStop(1, 'rgba(245, 245, 220, 0.3)');

    ctx.beginPath();
    ctx.arc(gameState.mousePos.x, gameState.mousePos.y, CONFIG.FLASHLIGHT_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    requestAnimationFrame(renderFlashlightPhase);
}

// Movement Phase
function startMovementPhase() {
    gameState.screen = 'movement';
    requestAnimationFrame(renderMovementPhase);
}

function renderMovementPhase() {
    if (gameState.screen !== 'movement') return;

    // Update player position
    updatePlayerPosition();

    // Check collisions and dead ends
    checkCollisions();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill entire canvas black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate offsets to center maze
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const offsetX = centerX - (CONFIG.GRID_SIZE * CONFIG.CELL_SIZE) / 2;
    const offsetY = centerY - (CONFIG.GRID_SIZE * CONFIG.CELL_SIZE) / 2;

    // Save context
    ctx.save();

    // Create circular clipping path around player
    const playerScreenX = offsetX + gameState.playerPos.x;
    const playerScreenY = offsetY + gameState.playerPos.y;

    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY, CONFIG.PLAYER_VISION_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // Draw maze within vision
    drawMaze(offsetX, offsetY);

    // Draw player
    ctx.fillStyle = '#f5f5dc';
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY, CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw player eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(playerScreenX - 3, playerScreenY - 2, 2, 0, Math.PI * 2);
    ctx.arc(playerScreenX + 3, playerScreenY - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Restore context
    ctx.restore();

    // Update goal icon position
    const goalScreenX = offsetX + gameState.goalPos.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const goalScreenY = offsetY + gameState.goalPos.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    goalIcon.style.left = goalScreenX - 16 + 'px';
    goalIcon.style.top = goalScreenY - 16 + 'px';
    goalIcon.style.display = 'block';

    requestAnimationFrame(renderMovementPhase);
}

function updatePlayerPosition() {
    const dx = gameState.mousePos.x - (canvas.width / 2);
    const dy = gameState.mousePos.y - (canvas.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 10) {
        const dirX = dx / distance;
        const dirY = dy / distance;

        const newX = gameState.playerPos.x + dirX * CONFIG.PLAYER_SPEED;
        const newY = gameState.playerPos.y + dirY * CONFIG.PLAYER_SPEED;

        // Check wall collision
        if (!checkWallCollision(newX, newY)) {
            gameState.playerPos.x = newX;
            gameState.playerPos.y = newY;
        }
    }
}

function checkWallCollision(x, y) {
    const cellX = Math.floor(x / CONFIG.CELL_SIZE);
    const cellY = Math.floor(y / CONFIG.CELL_SIZE);

    if (cellX < 0 || cellX >= CONFIG.GRID_SIZE || cellY < 0 || cellY >= CONFIG.GRID_SIZE) {
        return true;
    }

    const cell = gameState.maze[cellY][cellX];
    const cellOffsetX = x % CONFIG.CELL_SIZE;
    const cellOffsetY = y % CONFIG.CELL_SIZE;

    const margin = CONFIG.PLAYER_RADIUS + CONFIG.WALL_THICKNESS;

    if (cell.top && cellOffsetY < margin) return true;
    if (cell.bottom && cellOffsetY > CONFIG.CELL_SIZE - margin) return true;
    if (cell.left && cellOffsetX < margin) return true;
    if (cell.right && cellOffsetX > CONFIG.CELL_SIZE - margin) return true;

    return false;
}

function checkCollisions() {
    const cellX = Math.floor(gameState.playerPos.x / CONFIG.CELL_SIZE);
    const cellY = Math.floor(gameState.playerPos.y / CONFIG.CELL_SIZE);

    // Check if reached goal
    if (cellX === gameState.goalPos.x && cellY === gameState.goalPos.y) {
        if (!gameState.hasReachedGoal) {
            gameState.hasReachedGoal = true;
            winGame();
        }
        return;
    }

    // Check if in dead end
    if (gameState.maze[cellY][cellX].isDeadEnd) {
        loseLife();
    }
}

function loseLife() {
    gameState.screen = 'paused';
    gameState.lives--;
    updateUI();

    showMessage("You take the wrong way");

    setTimeout(() => {
        hideMessage();

        if (gameState.lives <= 0) {
            gameOver();
        } else if (gameState.flashlights <= 0) {
            gameOver();
        } else {
            // Reset player position
            gameState.playerPos = {
                x: CONFIG.CELL_SIZE / 2,
                y: CONFIG.CELL_SIZE / 2
            };
            startFlashlightPhase();
        }
    }, 2000);
}

function gameOver() {
    showScreen('failure');
}

function winGame() {
    gameState.screen = 'paused';
    showScreen('success');
}

// Drawing
function drawMaze(offsetX, offsetY) {
    const maze = gameState.maze;

    ctx.strokeStyle = '#f5f5dc';
    ctx.lineWidth = CONFIG.WALL_THICKNESS;

    for (let y = 0; y < CONFIG.GRID_SIZE; y++) {
        for (let x = 0; x < CONFIG.GRID_SIZE; x++) {
            const cell = maze[y][x];
            const cellX = offsetX + x * CONFIG.CELL_SIZE;
            const cellY = offsetY + y * CONFIG.CELL_SIZE;

            ctx.beginPath();

            if (cell.top) {
                ctx.moveTo(cellX, cellY);
                ctx.lineTo(cellX + CONFIG.CELL_SIZE, cellY);
            }

            if (cell.right) {
                ctx.moveTo(cellX + CONFIG.CELL_SIZE, cellY);
                ctx.lineTo(cellX + CONFIG.CELL_SIZE, cellY + CONFIG.CELL_SIZE);
            }

            if (cell.bottom) {
                ctx.moveTo(cellX, cellY + CONFIG.CELL_SIZE);
                ctx.lineTo(cellX + CONFIG.CELL_SIZE, cellY + CONFIG.CELL_SIZE);
            }

            if (cell.left) {
                ctx.moveTo(cellX, cellY);
                ctx.lineTo(cellX, cellY + CONFIG.CELL_SIZE);
            }

            ctx.stroke();
        }
    }

    // Draw outer border
    ctx.strokeRect(offsetX, offsetY,
        CONFIG.GRID_SIZE * CONFIG.CELL_SIZE,
        CONFIG.GRID_SIZE * CONFIG.CELL_SIZE);

    // Draw goal
    ctx.fillStyle = '#f5f5dc';
    const goalX = offsetX + gameState.goalPos.x * CONFIG.CELL_SIZE;
    const goalY = offsetY + gameState.goalPos.y * CONFIG.CELL_SIZE;

    // Draw simple house shape
    ctx.beginPath();
    ctx.moveTo(goalX + CONFIG.CELL_SIZE / 2, goalY + 5);
    ctx.lineTo(goalX + CONFIG.CELL_SIZE - 5, goalY + CONFIG.CELL_SIZE / 2);
    ctx.lineTo(goalX + CONFIG.CELL_SIZE - 5, goalY + CONFIG.CELL_SIZE - 5);
    ctx.lineTo(goalX + 5, goalY + CONFIG.CELL_SIZE - 5);
    ctx.lineTo(goalX + 5, goalY + CONFIG.CELL_SIZE / 2);
    ctx.closePath();
    ctx.fill();
}

// UI Updates
function updateUI() {
    // Update hearts
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index >= gameState.lives) {
            heart.classList.add('lost');
        } else {
            heart.classList.remove('lost');
        }
    });

    // Update flashlights
    const flashlights = document.querySelectorAll('.flashlight');
    flashlights.forEach((flashlight, index) => {
        if (index >= gameState.flashlights) {
            flashlight.classList.add('used');
        } else {
            flashlight.classList.remove('used');
        }
    });
}

function updateTimerDisplay() {
    const seconds = gameState.timer;
    timerDisplay.textContent = `00:${seconds.toString().padStart(2, '0')}`;
}

function showMessage(msg) {
    messageText.textContent = msg;
    messageOverlay.classList.remove('hidden');
}

function hideMessage() {
    messageOverlay.classList.add('hidden');
}

// Event Handlers
function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    gameState.mousePos.x = e.clientX - rect.left;
    gameState.mousePos.y = e.clientY - rect.top;
}

function handleClick(e) {
    if (gameState.screen === 'paused') {
        hideMessage();
    }
}

// Start
init();
