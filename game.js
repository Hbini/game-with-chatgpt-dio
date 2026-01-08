// Game Logic - Interactive Game with ChatGPT
// Created with HTML5, CSS3 and JavaScript
// Projeto DIO

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameActive = false;
        this.gamePaused = false;
        this.frameCount = 0;
        
        // Player
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 60,
            width: 30,
            height: 30,
            speed: 5,
            velocityY: 0,
            isJumping: false
        };
        
        // Items to collect
        this.items = [];
        this.enemies = [];
        this.particles = [];
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        this.createItems();
        this.createEnemies();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => { this.keys[e.key] = true; });
        document.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
        
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    }
    
    createItems() {
        this.items = [];
        for (let i = 0; i < 5 + this.level * 2; i++) {
            this.items.push({
                x: Math.random() * (this.canvas.width - 20),
                y: Math.random() * (this.canvas.height - 100),
                width: 15,
                height: 15,
                collected: false,
                points: 10
            });
        }
    }
    
    createEnemies() {
        this.enemies = [];
        for (let i = 0; i < this.level + 1; i++) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 30),
                y: Math.random() * (this.canvas.height - 150),
                width: 25,
                height: 25,
                speedX: (Math.random() - 0.5) * 4,
                speedY: (Math.random() - 0.5) * 2
            });
        }
    }
    
    start() {
        if (!this.gameActive) {
            this.gameActive = true;
            this.gamePaused = false;
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('restartBtn').disabled = false;
            this.gameLoop();
        }
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Retomar' : 'Pausar';
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    restart() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameActive = false;
        this.gamePaused = false;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 60;
        this.createItems();
        this.createEnemies();
        this.updateUI();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('restartBtn').disabled = true;
        this.draw();
    }
    
    gameLoop() {
        if (!this.gamePaused && this.gameActive) {
            this.update();
            this.checkCollisions();
            this.draw();
        }
        if (this.gameActive) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    update() {
        // Player movement
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.x += this.player.speed;
        }
        if ((this.keys[' '] || this.keys['ArrowUp']) && !this.player.isJumping) {
            this.player.velocityY = -12;
            this.player.isJumping = true;
        }
        
        // Gravity
        this.player.velocityY += 0.6;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y + this.player.height >= this.canvas.height) {
            this.player.y = this.canvas.height - this.player.height;
            this.player.isJumping = false;
            this.player.velocityY = 0;
        }
        
        // Boundary check
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.x += enemy.speedX;
            enemy.y += enemy.speedY;
            
            if (enemy.x < 0 || enemy.x + enemy.width > this.canvas.width) {
                enemy.speedX *= -1;
            }
            if (enemy.y < 0 || enemy.y + enemy.height > this.canvas.height) {
                enemy.speedY *= -1;
            }
        });
    }
    
    checkCollisions() {
        // Check item collection
        this.items.forEach(item => {
            if (!item.collected && this.isColliding(this.player, item)) {
                item.collected = true;
                this.score += item.points;
                this.createParticles(item.x, item.y);
                
                if (this.items.every(i => i.collected)) {
                    this.nextLevel();
                }
            }
        });
        
        // Check enemy collision
        this.enemies.forEach(enemy => {
            if (this.isColliding(this.player, enemy)) {
                this.lives--;
                this.player.x = this.canvas.width / 2;
                this.player.y = this.canvas.height - 60;
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
        
        this.updateUI();
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 6,
                velocityY: (Math.random() - 0.5) * 6,
                life: 30,
                maxLife: 30
            });
        }
    }
    
    nextLevel() {
        this.level++;
        this.score += 100;
        this.createItems();
        this.createEnemies();
    }
    
    gameOver() {
        this.gameActive = false;
        alert('Game Over! Score: ' + this.score + ' Level: ' + this.level);
        this.restart();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#667eea';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw items
        this.ctx.fillStyle = '#fbbf24';
        this.items.forEach(item => {
            if (!item.collected) {
                this.ctx.beginPath();
                this.ctx.arc(item.x + 7.5, item.y + 7.5, 7.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw enemies
        this.ctx.fillStyle = '#ef4444';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
        
        // Draw particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
        this.particles.forEach(p => {
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.life--;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw UI
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Level: ' + this.level, 10, 20);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.updateUI();
    game.draw();
});
