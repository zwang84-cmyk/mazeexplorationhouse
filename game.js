// Game Configuration
const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    colors: {
        background: '#D4A574',  // Light brown
        path: '#FFFFFF',        // White
        darkClouds: 'rgba(40, 40, 45, 0.98)', // Dark gray/black clouds
        character: '#FFD700',   // Gold
        house: '#8B4513',       // Brown
    },
    character: {
        size: 10,
        speed: 2.5,
        visionRadius: 30
    },
    flashlight: {
        duration: 10000, // 10 seconds
        maxUses: 3
    },
    lives: 3,
    pathWidth: 35
};

// Game State
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lives = CONFIG.lives;
        this.flashlightUses = CONFIG.flashlight.maxUses;
        this.phase = 'WAITING'; // WAITING, FLASHLIGHT, MOVING, WIN, LOSE
        this.flashlightTimer = null;
        this.flashlightTimeLeft = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.character = {
            x: 50,
            y: 50,
            targetX: 50,
            targetY: 50,
            lastValidX: 50,
            lastValidY: 50
        };

        this.house = {
            x: 750,
            y: 550,
            size: 35
        };

        // Generate maze
        this.generateMaze();

        // Setup event listeners
        this.setupEventListeners();

        // Start game loop
        this.gameLoop();
    }

    generateMaze() {
        // Create a more complex maze inspired by the reference images
        this.maze = {
            correctPath: [],
            deadEnds: [],
            allPaths: []
        };

        // Main correct path - create a winding path from start to house
        const correctPath = [];

        // Start point
        let currentX = 50;
        let currentY = 50;

        // Create main path with multiple turns and curves
        const waypoints = [
            { x: 50, y: 50 },
            { x: 150, y: 80 },
            { x: 250, y: 120 },
            { x: 320, y: 200 },
            { x: 400, y: 250 },
            { x: 480, y: 320 },
            { x: 550, y: 380 },
            { x: 620, y: 450 },
            { x: 700, y: 500 },
            { x: 750, y: 550 }
        ];

        // Interpolate between waypoints to create smooth path
        for (let i = 0; i < waypoints.length - 1; i++) {
            const start = waypoints[i];
            const end = waypoints[i + 1];
            const steps = 50;

            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const x = start.x + (end.x - start.x) * t + Math.sin(t * Math.PI * 4) * 15;
                const y = start.y + (end.y - start.y) * t + Math.cos(t * Math.PI * 3) * 15;
                correctPath.push({ x, y });
            }
        }

        this.maze.correctPath = correctPath;

        // Generate dead-end paths branching from the main path
        this.generateDeadEnd([
            { x: 150, y: 80 },
            { x: 100, y: 150 },
            { x: 80, y: 220 },
            { x: 60, y: 300 }
        ]);

        this.generateDeadEnd([
            { x: 250, y: 120 },
            { x: 300, y: 80 },
            { x: 380, y: 60 },
            { x: 450, y: 80 }
        ]);

        this.generateDeadEnd([
            { x: 400, y: 250 },
            { x: 350, y: 350 },
            { x: 300, y: 420 }
        ]);

        this.generateDeadEnd([
            { x: 480, y: 320 },
            { x: 580, y: 280 },
            { x: 650, y: 250 },
            { x: 720, y: 230 }
        ]);

        this.generateDeadEnd([
            { x: 620, y: 450 },
            { x: 550, y: 520 },
            { x: 480, y: 560 }
        ]);

        // Compile all valid paths
        this.maze.allPaths = [this.maze.correctPath, ...this.maze.deadEnds];
    }

    generateDeadEnd(waypoints) {
        const deadEnd = [];
        for (let i = 0; i < waypoints.length - 1; i++) {
            const start = waypoints[i];
            const end = waypoints[i + 1];
            const steps = 30;

            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const x = start.x + (end.x - start.x) * t + Math.sin(t * Math.PI * 2) * 8;
                const y = start.y + (end.y - start.y) * t + Math.cos(t * Math.PI * 2) * 8;
                deadEnd.push({ x, y });
            }
        }
        this.maze.deadEnds.push(deadEnd);
    }

    setupEventListeners() {
        // Flashlight button click
        document.getElementById('flashlight-btn').addEventListener('click', () => {
            if (this.phase === 'WAITING' && this.flashlightUses > 0) {
                this.startFlashlight();
            }
        });

        // Mouse move for character control
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        if (this.phase === 'MOVING' || this.phase === 'MOVING_FINAL') {
            this.character.targetX = this.mouseX;
            this.character.targetY = this.mouseY;
        }
    }

    startFlashlight() {
        this.phase = 'FLASHLIGHT';
        this.flashlightUses--;
        this.flashlightTimeLeft = CONFIG.flashlight.duration;
        this.updateUI();

        const startTime = Date.now();
        this.flashlightTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            this.flashlightTimeLeft = CONFIG.flashlight.duration - elapsed;

            if (this.flashlightTimeLeft <= 0) {
                this.endFlashlight();
            }
        }, 100);
    }

    endFlashlight() {
        clearInterval(this.flashlightTimer);
        this.flashlightTimer = null;

        if (this.flashlightUses > 0 || this.lives > 1) {
            this.phase = 'MOVING';
        } else {
            this.phase = 'MOVING_FINAL';
        }
        this.updateUI();
    }

    updateCharacter() {
        if (this.phase !== 'MOVING' && this.phase !== 'MOVING_FINAL') return;

        const dx = this.character.targetX - this.character.x;
        const dy = this.character.targetY - this.character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > CONFIG.character.speed) {
            const newX = this.character.x + (dx / distance) * CONFIG.character.speed;
            const newY = this.character.y + (dy / distance) * CONFIG.character.speed;

            // Check if new position is valid
            if (this.isOnValidPath(newX, newY)) {
                this.character.x = newX;
                this.character.y = newY;
                this.character.lastValidX = newX;
                this.character.lastValidY = newY;

                // Check if reached house
                this.checkWinCondition();
            } else {
                // Check if moved off path into nowhere
                this.checkOffPath(newX, newY);
            }
        }
    }

    isOnValidPath(x, y) {
        // Check all paths
        for (const path of this.maze.allPaths) {
            for (const point of path) {
                const dist = Math.sqrt(
                    Math.pow(x - point.x, 2) +
                    Math.pow(y - point.y, 2)
                );
                if (dist < CONFIG.pathWidth / 2) {
                    return true;
                }
            }
        }
        return false;
    }

    checkOffPath(x, y) {
        // If character tries to move significantly off any path
        const distFromStart = Math.sqrt(
            Math.pow(x - 50, 2) +
            Math.pow(y - 50, 2)
        );

        // Only check if moved away from start
        if (distFromStart > 60) {
            const distFromLast = Math.sqrt(
                Math.pow(x - this.character.lastValidX, 2) +
                Math.pow(y - this.character.lastValidY, 2)
            );

            if (distFromLast > 20) {
                // Moved off path - check if at dead end
                this.checkDeadEnd();
            }
        }
    }

    checkDeadEnd() {
        // Check if at the end of any dead-end path
        for (const deadEnd of this.maze.deadEnds) {
            const lastPoint = deadEnd[deadEnd.length - 1];
            const dist = Math.sqrt(
                Math.pow(this.character.x - lastPoint.x, 2) +
                Math.pow(this.character.y - lastPoint.y, 2)
            );

            if (dist < CONFIG.pathWidth) {
                // At a dead end!
                this.loseLife();
                return;
            }
        }
    }

    checkWinCondition() {
        const distToHouse = Math.sqrt(
            Math.pow(this.character.x - this.house.x, 2) +
            Math.pow(this.character.y - this.house.y, 2)
        );

        if (distToHouse < this.house.size) {
            this.win();
        }
    }

    loseLife() {
        this.lives--;
        this.updateUI();

        // Reset character position
        this.character.x = 50;
        this.character.y = 50;
        this.character.targetX = 50;
        this.character.targetY = 50;
        this.character.lastValidX = 50;
        this.character.lastValidY = 50;

        if (this.lives <= 0) {
            this.lose();
        } else {
            // Return to waiting phase if flashlights available
            if (this.flashlightUses > 0) {
                this.phase = 'WAITING';
            } else {
                // No flashlights left but has lives
                this.lose();
            }
        }
    }

    win() {
        this.phase = 'WIN';
        this.showModal('🎉 Congratulations! 🎉', 'You successfully helped the character find their way home!');
    }

    lose() {
        this.phase = 'LOSE';
        if (this.lives <= 0) {
            this.showModal('💔 Help Failed', 'The character lost all lives. Try again!');
        } else {
            this.showModal('🔦 Help Failed', 'You ran out of flashlight uses!');
        }
    }

    showModal(title, message) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal').classList.remove('hidden');
    }

    restart() {
        document.getElementById('modal').classList.add('hidden');
        this.lives = CONFIG.lives;
        this.flashlightUses = CONFIG.flashlight.maxUses;
        this.phase = 'WAITING';
        this.character.x = 50;
        this.character.y = 50;
        this.character.targetX = 50;
        this.character.targetY = 50;
        this.character.lastValidX = 50;
        this.character.lastValidY = 50;
        this.flashlightTimeLeft = 0;
        if (this.flashlightTimer) {
            clearInterval(this.flashlightTimer);
            this.flashlightTimer = null;
        }
        this.generateMaze();
        this.updateUI();
    }

    updateUI() {
        // Update lives
        const heartsArray = Array(this.lives).fill('❤️');
        const emptyHearts = Array(CONFIG.lives - this.lives).fill('🖤');
        document.getElementById('lives').textContent = heartsArray.concat(emptyHearts).join('');

        // Update flashlight button
        const flashlightBtn = document.getElementById('flashlight-btn');
        const flashlightCount = document.getElementById('flashlight-count');
        flashlightCount.textContent = `(${this.flashlightUses} left)`;

        if (this.flashlightUses === 0 || this.phase === 'FLASHLIGHT') {
            flashlightBtn.disabled = true;
        } else {
            flashlightBtn.disabled = false;
        }

        // Update phase text
        const phaseEl = document.getElementById('phase');
        switch (this.phase) {
            case 'WAITING':
                phaseEl.textContent = '🔦 Click flashlight button!';
                break;
            case 'FLASHLIGHT':
                const secondsLeft = Math.ceil(this.flashlightTimeLeft / 1000);
                phaseEl.textContent = `👀 Flashlight: ${secondsLeft}s`;
                break;
            case 'MOVING':
                phaseEl.textContent = '🖱️ Guide with mouse';
                break;
            case 'MOVING_FINAL':
                phaseEl.textContent = '⚠️ Last chance!';
                break;
        }
    }

    drawMaze() {
        // Only draw maze during flashlight phase
        if (this.phase !== 'FLASHLIGHT') {
            return;
        }

        this.ctx.strokeStyle = CONFIG.colors.path;
        this.ctx.lineWidth = CONFIG.pathWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Draw all paths (correct and dead ends)
        for (const path of this.maze.allPaths) {
            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }
            this.ctx.stroke();
        }
    }

    drawHouse() {
        // Only draw house during flashlight phase or if character is near
        const distToHouse = Math.sqrt(
            Math.pow(this.character.x - this.house.x, 2) +
            Math.pow(this.character.y - this.house.y, 2)
        );

        if (this.phase === 'FLASHLIGHT' || distToHouse < CONFIG.character.visionRadius + 20) {
            // Draw house base
            this.ctx.fillStyle = CONFIG.colors.house;
            this.ctx.fillRect(
                this.house.x - this.house.size / 2,
                this.house.y - this.house.size / 2,
                this.house.size,
                this.house.size * 0.7
            );

            // Draw roof
            this.ctx.beginPath();
            this.ctx.moveTo(this.house.x - this.house.size / 2 - 5, this.house.y - this.house.size / 2);
            this.ctx.lineTo(this.house.x, this.house.y - this.house.size / 2 - 20);
            this.ctx.lineTo(this.house.x + this.house.size / 2 + 5, this.house.y - this.house.size / 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw door
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(
                this.house.x - 8,
                this.house.y,
                16,
                20
            );
        }
    }

    drawCharacter() {
        // Draw character
        this.ctx.fillStyle = CONFIG.colors.character;
        this.ctx.beginPath();
        this.ctx.arc(this.character.x, this.character.y, CONFIG.character.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw eyes
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.character.x - 3, this.character.y - 2, 1.5, 0, Math.PI * 2);
        this.ctx.arc(this.character.x + 3, this.character.y - 2, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawDarkClouds() {
        if (this.phase === 'WAITING' || this.phase === 'WIN' || this.phase === 'LOSE') {
            // Full dark cloud cover
            this.ctx.fillStyle = CONFIG.colors.darkClouds;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else if (this.phase === 'MOVING' || this.phase === 'MOVING_FINAL') {
            // Dark clouds everywhere
            this.ctx.fillStyle = CONFIG.colors.darkClouds;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Clear small area around character
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';

            const gradient = this.ctx.createRadialGradient(
                this.character.x, this.character.y, 0,
                this.character.x, this.character.y, CONFIG.character.visionRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(this.character.x, this.character.y, CONFIG.character.visionRadius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        }
        // Note: During FLASHLIGHT phase, no dark clouds are drawn so maze is visible
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze (only visible during flashlight phase)
        this.drawMaze();

        // Draw house (only visible during flashlight or when near)
        this.drawHouse();

        // Draw character
        this.drawCharacter();

        // Draw dark clouds (fog of war)
        this.drawDarkClouds();

        // If game is over, add extra darkness
        if (this.phase === 'WIN' || this.phase === 'LOSE') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    gameLoop() {
        this.updateCharacter();
        this.render();

        if (this.phase === 'FLASHLIGHT') {
            this.updateUI();
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    new Game();
});
