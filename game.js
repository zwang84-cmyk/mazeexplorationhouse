// Game Configuration
const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    colors: {
        background: '#D4A574',  // Light brown
        path: '#FFFFFF',        // White
        clouds: 'rgba(173, 216, 230, 0.95)', // Light blue with opacity
        character: '#FFD700',   // Gold
        house: '#8B4513',       // Brown
        flashlight: 'rgba(255, 255, 150, 0.3)'
    },
    character: {
        size: 12,
        speed: 2,
        visionRadius: 25
    },
    flashlight: {
        radius: 120,
        duration: 10000, // 10 seconds
        maxUses: 3
    },
    lives: 3
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
            targetY: 50
        };

        this.house = {
            x: 750,
            y: 550,
            size: 40
        };

        // Generate maze
        this.generateMaze();

        // Setup event listeners
        this.setupEventListeners();

        // Start game loop
        this.gameLoop();
    }

    generateMaze() {
        // Create a maze structure with paths
        this.maze = {
            paths: [],
            deadEnds: []
        };

        // Main correct path (simplified wavy path from start to house)
        const correctPath = [];
        for (let i = 0; i <= 100; i++) {
            const progress = i / 100;
            const x = 50 + progress * 700;
            const y = 50 + Math.sin(progress * Math.PI * 3) * 200 + progress * 500;
            correctPath.push({ x, y });
        }

        // Add dead-end paths
        const deadEnd1 = [];
        for (let i = 0; i <= 30; i++) {
            const progress = i / 30;
            deadEnd1.push({
                x: 200 + progress * 150,
                y: 100 + progress * 200 - Math.sin(progress * Math.PI * 2) * 50
            });
        }

        const deadEnd2 = [];
        for (let i = 0; i <= 40; i++) {
            const progress = i / 40;
            deadEnd2.push({
                x: 400 + progress * 100 + Math.cos(progress * Math.PI * 3) * 50,
                y: 200 + progress * 100
            });
        }

        const deadEnd3 = [];
        for (let i = 0; i <= 35; i++) {
            const progress = i / 35;
            deadEnd3.push({
                x: 550 - progress * 150,
                y: 400 + progress * 150 + Math.sin(progress * Math.PI * 2) * 30
            });
        }

        this.maze.correctPath = correctPath;
        this.maze.deadEnds = [deadEnd1, deadEnd2, deadEnd3];
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }

    handleClick(e) {
        if (this.phase === 'WAITING' && this.flashlightUses > 0) {
            this.startFlashlight();
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        if (this.phase === 'MOVING') {
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

        if (this.flashlightUses > 0) {
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
            this.character.x += (dx / distance) * CONFIG.character.speed;
            this.character.y += (dy / distance) * CONFIG.character.speed;

            // Check collisions
            this.checkCollisions();
        }
    }

    checkCollisions() {
        // Check if reached house
        const distToHouse = Math.sqrt(
            Math.pow(this.character.x - this.house.x, 2) +
            Math.pow(this.character.y - this.house.y, 2)
        );

        if (distToHouse < this.house.size / 2) {
            this.win();
            return;
        }

        // Check if on correct path
        let onCorrectPath = false;
        for (const point of this.maze.correctPath) {
            const dist = Math.sqrt(
                Math.pow(this.character.x - point.x, 2) +
                Math.pow(this.character.y - point.y, 2)
            );
            if (dist < 40) {
                onCorrectPath = true;
                break;
            }
        }

        // Check if in dead end
        let inDeadEnd = false;
        for (const deadEnd of this.maze.deadEnds) {
            for (const point of deadEnd) {
                const dist = Math.sqrt(
                    Math.pow(this.character.x - point.x, 2) +
                    Math.pow(this.character.y - point.y, 2)
                );
                if (dist < 30) {
                    inDeadEnd = true;
                    break;
                }
            }
            if (inDeadEnd) break;
        }

        // If moved significantly and not on any path
        const distFromStart = Math.sqrt(
            Math.pow(this.character.x - 50, 2) +
            Math.pow(this.character.y - 50, 2)
        );

        if (inDeadEnd && distFromStart > 100) {
            // Check if at the end of dead end
            let atDeadEndTip = false;
            for (const deadEnd of this.maze.deadEnds) {
                const lastPoint = deadEnd[deadEnd.length - 1];
                const distToEnd = Math.sqrt(
                    Math.pow(this.character.x - lastPoint.x, 2) +
                    Math.pow(this.character.y - lastPoint.y, 2)
                );
                if (distToEnd < 30) {
                    atDeadEndTip = true;
                    break;
                }
            }

            if (atDeadEndTip) {
                this.loseLife();
            }
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

        if (this.lives <= 0) {
            this.lose();
        } else {
            // Return to waiting phase if flashlights available
            if (this.flashlightUses > 0) {
                this.phase = 'WAITING';
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
            this.showModal('💔 Help Failed', 'The character lost all lives. Better luck next time!');
        } else {
            this.showModal('🔦 Help Failed', 'You ran out of flashlight uses. The maze remains a mystery!');
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

        // Update flashlight uses
        const flashlights = Array(this.flashlightUses).fill('🔦');
        const usedFlashlights = Array(CONFIG.flashlight.maxUses - this.flashlightUses).fill('🔦');
        document.getElementById('flashlight-uses').textContent = flashlights.join('') +
            (usedFlashlights.length > 0 ? '<span style="opacity:0.3">' + usedFlashlights.join('') + '</span>' : '');
        document.getElementById('flashlight-uses').innerHTML = flashlights.join('') +
            (usedFlashlights.length > 0 ? '<span style="opacity:0.3">' + usedFlashlights.join('') + '</span>' : '');

        // Update phase
        const phaseEl = document.getElementById('phase');
        switch (this.phase) {
            case 'WAITING':
                phaseEl.textContent = '🔦 Click to use flashlight!';
                break;
            case 'FLASHLIGHT':
                const secondsLeft = Math.ceil(this.flashlightTimeLeft / 1000);
                phaseEl.textContent = `👀 Flashlight active: ${secondsLeft}s`;
                break;
            case 'MOVING':
                phaseEl.textContent = '🖱️ Move mouse to guide character';
                break;
            case 'MOVING_FINAL':
                phaseEl.textContent = '⚠️ Final attempt - no flashlights left!';
                break;
        }
    }

    drawMaze() {
        // Draw correct path
        this.ctx.strokeStyle = CONFIG.colors.path;
        this.ctx.lineWidth = 40;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(this.maze.correctPath[0].x, this.maze.correctPath[0].y);
        for (let i = 1; i < this.maze.correctPath.length; i++) {
            this.ctx.lineTo(this.maze.correctPath[i].x, this.maze.correctPath[i].y);
        }
        this.ctx.stroke();

        // Draw dead ends
        for (const deadEnd of this.maze.deadEnds) {
            this.ctx.beginPath();
            this.ctx.moveTo(deadEnd[0].x, deadEnd[0].y);
            for (let i = 1; i < deadEnd.length; i++) {
                this.ctx.lineTo(deadEnd[i].x, deadEnd[i].y);
            }
            this.ctx.stroke();
        }
    }

    drawHouse() {
        // Draw house
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

    drawCharacter() {
        // Draw character
        this.ctx.fillStyle = CONFIG.colors.character;
        this.ctx.beginPath();
        this.ctx.arc(this.character.x, this.character.y, CONFIG.character.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw eyes
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.character.x - 4, this.character.y - 3, 2, 0, Math.PI * 2);
        this.ctx.arc(this.character.x + 4, this.character.y - 3, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawClouds() {
        if (this.phase === 'FLASHLIGHT') {
            // Draw flashlight effect
            this.ctx.save();

            // Create clipping region (inverse of flashlight)
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = CONFIG.colors.clouds;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Clear flashlight area
            this.ctx.globalCompositeOperation = 'destination-out';
            const gradient = this.ctx.createRadialGradient(
                this.mouseX, this.mouseY, 0,
                this.mouseX, this.mouseY, CONFIG.flashlight.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, CONFIG.flashlight.radius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        } else if (this.phase === 'MOVING' || this.phase === 'MOVING_FINAL') {
            // Draw clouds everywhere
            this.ctx.fillStyle = CONFIG.colors.clouds;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Clear small area around character
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            const gradient = this.ctx.createRadialGradient(
                this.character.x, this.character.y, 0,
                this.character.x, this.character.y, CONFIG.character.visionRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(this.character.x, this.character.y, CONFIG.character.visionRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        } else if (this.phase === 'WAITING') {
            // Full cloud cover
            this.ctx.fillStyle = CONFIG.colors.clouds;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze
        this.drawMaze();

        // Draw house
        this.drawHouse();

        // Draw character
        this.drawCharacter();

        // Draw clouds (fog of war)
        this.drawClouds();

        // If game is over, darken screen slightly
        if (this.phase === 'WIN' || this.phase === 'LOSE') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
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
