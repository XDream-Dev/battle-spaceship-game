// JavaScript code for the spaceship game 

// This code handles the game logic, player controls, and UI interactions.
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        body.classList.add('light-mode');
        themeToggle.checked = true;
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Game elements
    const gameArea = document.getElementById('game-area');
    const startScreen = document.getElementById('start-screen');
    const skinSelectionScreen = document.getElementById('skin-selection-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const winnerText = document.getElementById('winner-text');
    const startSelectionBtn = document.getElementById('start-selection');
    const startGameBtn = document.getElementById('start-game');
    const playAgainBtn = document.getElementById('play-again');
    const changeShipsBtn = document.getElementById('change-ships');
    const healthBar1 = document.getElementById('health-bar-1');
    const healthBar2 = document.getElementById('health-bar-2');
    const player1ScoreElement = document.getElementById('player1-score');
    const player2ScoreElement = document.getElementById('player2-score');
    
    // Skin selection elements
    const player1SkinGrid = document.getElementById('player1-skins');
    const player2SkinGrid = document.getElementById('player2-skins');
    const player1Preview = document.getElementById('player1-preview');
    const player2Preview = document.getElementById('player2-preview');
    const player1ReadyBtn = document.getElementById('player1-ready');
    const player2ReadyBtn = document.getElementById('player2-ready');
    const player1ReadyIndicator = document.getElementById('player1-ready-indicator');
    const player2ReadyIndicator = document.getElementById('player2-ready-indicator');
    
    // Game state
    let gameRunning = false;
    let gameLoop;
    let player1Score = 0;
    let player2Score = 0;
    let player1Ready = false;
    let player2Ready = false;
    
    // Game settings
    let gameWidth = gameArea.clientWidth;
    let gameHeight = gameArea.clientHeight;
    const shipSize = 40;
    const bulletSize = 6;
    const bulletSpeed = 7;
    const powerUpSpawnInterval = 5000; // 5 seconds
    
    // Ship skins
    const shipSkins = [
        {
            name: 'Fire',
            color: '#ef4444',
            secondaryColor: '#f87171',
            bulletColor: '#ef4444',
            svg: `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 10H16L12 2Z" fill="#ef4444"/>
                    <path d="M8 10H16V18H8V10Z" fill="#f87171"/>
                    <path d="M9 18L8 22H16L15 18H9Z" fill="#fca5a5"/>
                    <path d="M10 10H14V18H10V10Z" fill="#b91c1c"/>
                    <path d="M9 10.5L7 8L8 12L9 10.5Z" fill="#fdba74"/>
                    <path d="M15 10.5L17 8L16 12L15 10.5Z" fill="#fdba74"/>
                </svg>
            `
        },
        {
            name: 'Water',
            color: '#3b82f6',
            secondaryColor: '#60a5fa',
            bulletColor: '#3b82f6',
            svg: `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 10H16L12 2Z" fill="#3b82f6"/>
                    <path d="M8 10H16V18H8V10Z" fill="#60a5fa"/>
                    <path d="M9 18L8 22H16L15 18H9Z" fill="#93c5fd"/>
                    <path d="M10 10H14V18H10V10Z" fill="#1d4ed8"/>
                    <path d="M8 14C8.5 13 9.5 13 10 14C10.5 15 11.5 15 12 14C12.5 13 13.5 13 14 14C14.5 15 15.5 15 16 14" stroke="#bfdbfe" stroke-width="0.5"/>
                </svg>
            `
        },
        {
            name: 'Earth',
            color: '#65a30d',
            secondaryColor: '#84cc16',
            bulletColor: '#65a30d',
            svg: `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 10H16L12 2Z" fill="#65a30d"/>
                    <path d="M8 10H16V18H8V10Z" fill="#84cc16"/>
                    <path d="M9 18L8 22H16L15 18H9Z" fill="#a3e635"/>
                    <path d="M10 10H14V18H10V10Z" fill="#4d7c0f"/>
                    <circle cx="10" cy="13" r="1" fill="#d9f99d"/>
                    <circle cx="14" cy="15" r="1" fill="#d9f99d"/>
                    <circle cx="12" cy="11" r="1" fill="#d9f99d"/>
                </svg>
            `
        },
        {
            name: 'Electric',
            color: '#facc15',
            secondaryColor: '#fde047',
            bulletColor: '#facc15',
            svg: `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 10H16L12 2Z" fill="#facc15"/>
                    <path d="M8 10H16V18H8V10Z" fill="#fde047"/>
                    <path d="M9 18L8 22H16L15 18H9Z" fill="#fef08a"/>
                    <path d="M10 10H14V18H10V10Z" fill="#ca8a04"/>
                    <path d="M12 6L10 12H14L12 18" stroke="#fef9c3" stroke-width="0.75"/>
                </svg>
            `
        },
        {
            name: 'Void',
            color: '#6b21a8',
            secondaryColor: '#8b5cf6',
            bulletColor: '#8b5cf6',
            svg: `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 10H16L12 2Z" fill="#6b21a8"/>
                    <path d="M8 10H16V18H8V10Z" fill="#8b5cf6"/>
                    <path d="M9 18L8 22H16L15 18H9Z" fill="#a78bfa"/>
                    <path d="M10 10H14V18H10V10Z" fill="#581c87"/>
                    <circle cx="10" cy="13" r="1" fill="#f5f3ff"/>
                    <circle cx="14" cy="13" r="1" fill="#f5f3ff"/>
                    <circle cx="12" cy="16" r="1" fill="#f5f3ff"/>
                </svg>
            `
        },
        {
            name: 'Lava',
            color: '#c2410c',
            secondaryColor: '#ea580c',
            bulletColor: '#ea580c',
            svg: `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 10H16L12 2Z" fill="#c2410c"/>
                    <path d="M8 10H16V18H8V10Z" fill="#ea580c"/>
                    <path d="M9 18L8 22H16L15 18H9Z" fill="#fb923c"/>
                    <path d="M10 10H14V18H10V10Z" fill="#9a3412"/>
                    <path d="M9 12C9.5 11 10.5 11 11 12C11.5 13 12.5 13 13 12C13.5 11 14.5 11 15 12" stroke="#fed7aa" stroke-width="0.5"/>
                    <path d="M9 15C9.5 14 10.5 14 11 15C11.5 16 12.5 16 13 15C13.5 14 14.5 14 15 15" stroke="#fed7aa" stroke-width="0.5"/>
                </svg>
            `
        },
        {
            name: 'Ice',
            color: '#0891b2',
            secondaryColor: '#06b6d4',
            bulletColor: '#06b6d4',
            svg: `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 10H16L12 2Z" fill="#0891b2"/>
                    <path d="M8 10H16V18H8V10Z" fill="#06b6d4"/>
                    <path d="M9 18L8 22H16L15 18H9Z" fill="#22d3ee"/>
                    <path d="M10 10H14V18H10V10Z" fill="#0e7490"/>
                    <path d="M12 6L13 8M12 6L11 8M12 6V4M12 14L13 16M12 14L11 16M12 14V12" stroke="#cffafe" stroke-width="0.5"/>
                    <path d="M9 10L10 12M9 10L8 12M9 10L7 9M15 10L14 12M15 10L16 12M15 10L17 9" stroke="#cffafe" stroke-width="0.5"/>
                </svg>
            `
        },
        {
            name: 'Wind',
            color: '#64748b',
            secondaryColor: '#94a3b8',
            bulletColor: '#94a3b8',
            svg: `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 10H16L12 2Z" fill="#64748b"/>
                    <path d="M8 10H16V18H8V10Z" fill="#94a3b8"/>
                    <path d="M9 18L8 22H16L15 18H9Z" fill="#cbd5e1"/>
                    <path d="M10 10H14V18H10V10Z" fill="#475569"/>
                    <path d="M8 11C9 10.5 10 11.5 9.5 12.5C9 13.5 10 14.5 11 14" stroke="#e2e8f0" stroke-width="0.5"/>
                    <path d="M13 11C14 10.5 15 11.5 14.5 12.5C14 13.5 15 14.5 16 14" stroke="#e2e8f0" stroke-width="0.5"/>
                </svg>
            `
        }
    ];
    
    // Player objects
    const player1 = {
        element: null,
        x: gameWidth * 0.25,
        y: gameHeight / 2,
        width: shipSize,
        height: shipSize,
        speed: 5,
        rotationSpeed: 5,
        rotation: 0,
        health: 100,
        bullets: [],
        lastShot: 0,
        shootCooldown: 300, // milliseconds
        shield: {
            active: false,
            element: null,
            duration: 5000, // 5 seconds
            timer: null
        },
        speedBoost: {
            active: false,
            duration: 5000, // 5 seconds
            timer: null,
            multiplier: 1.5
        },
        controls: {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false
        },
        skin: shipSkins[1] // Default to Water skin
    };
    
    const player2 = {
        element: null,
        x: gameWidth * 0.75,
        y: gameHeight / 2,
        width: shipSize,
        height: shipSize,
        speed: 5,
        rotationSpeed: 5,
        rotation: 180,
        health: 100,
        bullets: [],
        lastShot: 0,
        shootCooldown: 300, // milliseconds
        shield: {
            active: false,
            element: null,
            duration: 5000, // 5 seconds
            timer: null
        },
        speedBoost: {
            active: false,
            duration: 5000, // 5 seconds
            timer: null,
            multiplier: 1.5
        },
        controls: {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false
        },
        skin: shipSkins[0] // Default to Fire skin
    };
    
    // Power-ups
    let powerUps = [];
    let powerUpTimer;
    
    // Sound effects
    let shootSound;
    
    // Initialize sound effects
    function initSounds() {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        
        // Create shoot sound
        shootSound = {
            play: function(type) {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                // Different sound based on ship type
                if (type === 'fire' || type === 'lava') {
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);
                } else if (type === 'water' || type === 'ice') {
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.2);
                } else if (type === 'electric') {
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 0.1);
                } else if (type === 'void') {
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.3);
                } else {
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(550, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.2);
                }
                
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.2);
            }
        };
    }
    
    // Handle window resize
    function updateGameDimensions() {
        gameWidth = gameArea.clientWidth;
        gameHeight = gameArea.clientHeight;
        
        if (player1.element && player2.element) {
            // Keep players within bounds after resize
            player1.x = Math.max(player1.width/2, Math.min(gameWidth - player1.width/2, player1.x));
            player1.y = Math.max(player1.height/2, Math.min(gameHeight - player1.height/2, player1.y));
            player2.x = Math.max(player2.width/2, Math.min(gameWidth - player2.width/2, player2.x));
            player2.y = Math.max(player2.height/2, Math.min(gameHeight - player2.height/2, player2.y));
            
            updateShipPosition(player1);
            updateShipPosition(player2);
        }
    }
    
    window.addEventListener('resize', updateGameDimensions);
    
    // Create stars for background
    function createStars() {
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 2 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.opacity = Math.random() * 0.8 + 0.2;
            gameArea.appendChild(star);
        }
    }
    
    // Create spaceship elements
    function createSpaceships() {
        // Player 1 spaceship
        player1.element = document.createElement('div');
        player1.element.className = 'spaceship spaceship-1';
        player1.element.style.width = `${shipSize}px`;
        player1.element.style.height = `${shipSize}px`;
        player1.element.style.filter = `drop-shadow(0 0 8px ${player1.skin.color})`;
        player1.element.innerHTML = player1.skin.svg;
        gameArea.appendChild(player1.element);
        
        // Player 2 spaceship
        player2.element = document.createElement('div');
        player2.element.className = 'spaceship spaceship-2';
        player2.element.style.width = `${shipSize}px`;
        player2.element.style.height = `${shipSize}px`;
        player2.element.style.filter = `drop-shadow(0 0 8px ${player2.skin.color})`;
        player2.element.innerHTML = player2.skin.svg;
        gameArea.appendChild(player2.element);
        
        updateShipPosition(player1);
        updateShipPosition(player2);
    }
    
    // Update ship position and rotation
    function updateShipPosition(player) {
        if (!player.element) return;
        
        player.element.style.transform = `translate(${player.x - player.width/2}px, ${player.y - player.height/2}px) rotate(${player.rotation}deg)`;
    }
    
    // Create a bullet
    function createBullet(player, playerNum) {
        const now = Date.now();
        if (now - player.lastShot < player.shootCooldown) return;
        
        player.lastShot = now;
        
        // Play shoot sound based on skin
        shootSound.play(player.skin.name.toLowerCase());
        
        // Calculate bullet starting position based on ship rotation
        const radians = player.rotation * Math.PI / 180;
        const bulletX = player.x + Math.sin(radians) * (player.width / 2);
        const bulletY = player.y - Math.cos(radians) * (player.height / 2);
        
        const bullet = {
            element: document.createElement('div'),
            x: bulletX,
            y: bulletY,
            vx: Math.sin(radians) * bulletSpeed,
            vy: -Math.cos(radians) * bulletSpeed,
            width: bulletSize,
            height: bulletSize
        };
        
        bullet.element.className = `bullet bullet-${playerNum}`;
        bullet.element.style.width = `${bulletSize}px`;
        bullet.element.style.height = `${bulletSize}px`;
        bullet.element.style.backgroundColor = player.skin.bulletColor;
        bullet.element.style.boxShadow = `0 0 10px 2px ${player.skin.color}`;
        gameArea.appendChild(bullet.element);
        
        player.bullets.push(bullet);
        updateBulletPosition(bullet);
    }
    
    // Update bullet position
    function updateBulletPosition(bullet) {
        bullet.element.style.transform = `translate(${bullet.x}px, ${bullet.y}px)`;
    }
    
    // Move bullets
    function moveBullets() {
        // Move player 1 bullets
        for (let i = player1.bullets.length - 1; i >= 0; i--) {
            const bullet = player1.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Check if bullet is out of bounds
            if (bullet.x < 0 || bullet.x > gameWidth || bullet.y < 0 || bullet.y > gameHeight) {
                gameArea.removeChild(bullet.element);
                player1.bullets.splice(i, 1);
                continue;
            }
            
            // Check collision with player 2
            if (!player2.shield.active && checkCollision(bullet, player2)) {
                createExplosion(bullet.x, bullet.y, 'small', player1.skin.color);
                gameArea.removeChild(bullet.element);
                player1.bullets.splice(i, 1);
                player2.health -= 10;
                updateHealthBar(player2, healthBar2);
                
                if (player2.health <= 0) {
                    endRound('Player 1');
                }
                continue;
            }
            
            updateBulletPosition(bullet);
        }
        
        // Move player 2 bullets
        for (let i = player2.bullets.length - 1; i >= 0; i--) {
            const bullet = player2.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Check if bullet is out of bounds
            if (bullet.x < 0 || bullet.x > gameWidth || bullet.y < 0 || bullet.y > gameHeight) {
                gameArea.removeChild(bullet.element);
                player2.bullets.splice(i, 1);
                continue;
            }
            
            // Check collision with player 1
            if (!player1.shield.active && checkCollision(bullet, player1)) {
                createExplosion(bullet.x, bullet.y, 'small', player2.skin.color);
                gameArea.removeChild(bullet.element);
                player2.bullets.splice(i, 1);
                player1.health -= 10;
                updateHealthBar(player1, healthBar1);
                
                if (player1.health <= 0) {
                    endRound('Player 2');
                }
                continue;
            }
            
            updateBulletPosition(bullet);
        }
    }
    
    // Check collision between two objects
    function checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.width / 2 + obj2.width / 2);
    }
    
    // Create explosion effect
    function createExplosion(x, y, size, color = '#f59e0b') {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        
        if (size === 'large') {
            explosion.style.width = '80px';
            explosion.style.height = '80px';
        }
        
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        explosion.style.background = `radial-gradient(circle, rgba(255,215,0,1) 0%, ${color} 50%, rgba(255,69,0,0) 100%)`;
        gameArea.appendChild(explosion);
        
        setTimeout(() => {
            if (gameArea.contains(explosion)) {
                gameArea.removeChild(explosion);
            }
        }, 500);
    }
    
    // Update health bar
    function updateHealthBar(player, healthBar) {
        const health = Math.max(0, player.health);
        healthBar.style.width = `${health}%`;
    }
    
    // Create shield
    function createShield(player, playerNum) {
        if (player.shield.active) return;
        
        player.shield.active = true;
        
        // Create shield element
        const shield = document.createElement('div');
        shield.className = `shield shield-${playerNum}`;
        shield.style.width = `${player.width * 1.5}px`;
        shield.style.height = `${player.height * 1.5}px`;
        shield.style.left = `${player.x}px`;
        shield.style.top = `${player.y}px`;
        shield.style.borderColor = player.skin.color;
        shield.style.boxShadow = `0 0 15px ${player.skin.color}`;
        gameArea.appendChild(shield);
        
        player.shield.element = shield;
        
        // Set shield timer
        player.shield.timer = setTimeout(() => {
            player.shield.active = false;
            if (gameArea.contains(shield)) {
                gameArea.removeChild(shield);
            }
            player.shield.element = null;
        }, player.shield.duration);
    }
    
    // Update shield position
    function updateShieldPosition(player) {
        if (player.shield.active && player.shield.element) {
            player.shield.element.style.left = `${player.x}px`;
            player.shield.element.style.top = `${player.y}px`;
        }
    }
    
    // Apply speed boost
    function applySpeedBoost(player) {
        if (player.speedBoost.active) {
            clearTimeout(player.speedBoost.timer);
        }
        
        player.speedBoost.active = true;
        player.speed = 5 * player.speedBoost.multiplier;
        
        // Create visual effect (could be improved)
        player.element.style.filter = `drop-shadow(0 0 8px ${player.skin.color}) brightness(1.5)`;
        
        // Set speed boost timer
        player.speedBoost.timer = setTimeout(() => {
            player.speedBoost.active = false;
            player.speed = 5;
            player.element.style.filter = `drop-shadow(0 0 8px ${player.skin.color})`;
        }, player.speedBoost.duration);
    }
    
    // Create power-up
    function createPowerUp() {
        const types = ['health', 'shield', 'speed'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const powerUp = {
            element: document.createElement('div'),
            x: Math.random() * (gameWidth - 60) + 30,
            y: Math.random() * (gameHeight - 60) + 30,
            width: 30,
            height: 30,
            type: type
        };
        
        powerUp.element.className = 'power-up';
        
        // Modern potion SVG icons
        let powerUpSVG = '';
        
        if (type === 'health') {
            powerUpSVG = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 7V16C8 18.2091 9.79086 20 12 20C14.2091 20 16 18.2091 16 16V7L12 2Z" fill="#10b981" fill-opacity="0.8"/>
                    <path d="M10 9L14 9V16C14 17.1046 13.1046 18 12 18C10.8954 18 10 17.1046 10 16V9Z" fill="#34d399" fill-opacity="0.9"/>
                    <path d="M11 11H13V14H11V11Z" fill="white" fill-opacity="0.6"/>
                    <path d="M10 7L14 7L12 4L10 7Z" fill="#059669" fill-opacity="0.8"/>
                </svg>
            `;
        } else if (type === 'shield') {
            powerUpSVG = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z" fill="#8b5cf6" fill-opacity="0.8"/>
                    <path d="M12 4L6 7V12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12V7L12 4Z" fill="#a78bfa" fill-opacity="0.9"/>
                    <path d="M12 7L9 9V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V9L12 7Z" fill="#c4b5fd" fill-opacity="0.9"/>
                </svg>
            `;
        } else if (type === 'speed') {
            powerUpSVG = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 7V16C8 18.2091 9.79086 20 12 20C14.2091 20 16 18.2091 16 16V7L12 2Z" fill="#f59e0b" fill-opacity="0.8"/>
                    <path d="M10 9L14 9V16C14 17.1046 13.1046 18 12 18C10.8954 18 10 17.1046 10 16V9Z" fill="#fbbf24" fill-opacity="0.9"/>
                    <path d="M10 7L14 7L12 4L10 7Z" fill="#d97706" fill-opacity="0.8"/>
                    <path d="M11 11L13 11L12 14L11 11Z" fill="white" fill-opacity="0.6"/>
                    <path d="M10 13H14L12 16L10 13Z" fill="white" fill-opacity="0.6"/>
                </svg>
            `;
        }
        
        powerUp.element.innerHTML = powerUpSVG;
        gameArea.appendChild(powerUp.element);
        
        // Position the power-up
        powerUp.element.style.left = `${powerUp.x}px`;
        powerUp.element.style.top = `${powerUp.y}px`;
        
        powerUps.push(powerUp);
    }
    
    // Check power-up collisions
    function checkPowerUpCollisions() {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            
            // Check collision with player 1
            if (checkCollision(powerUp, player1)) {
                applyPowerUp(player1, 1, powerUp.type);
                gameArea.removeChild(powerUp.element);
                powerUps.splice(i, 1);
                continue;
            }
            
            // Check collision with player 2
            if (checkCollision(powerUp, player2)) {
                applyPowerUp(player2, 2, powerUp.type);
                gameArea.removeChild(powerUp.element);
                powerUps.splice(i, 1);
            }
        }
    }
    
    // Apply power-up effect
    function applyPowerUp(player, playerNum, type) {
        switch (type) {
            case 'health':
                player.health = Math.min(100, player.health + 25);
                updateHealthBar(player, playerNum === 1 ? healthBar1 : healthBar2);
                break;
            case 'shield':
                createShield(player, playerNum);
                break;
            case 'speed':
                applySpeedBoost(player);
                break;
        }
    }
    
    // Handle keyboard input
    function handleKeyDown(e) {
        if (!gameRunning) return;
        
        // Player 1 controls (WASD + Space)
        if (e.key === 'w' || e.key === 'W') player1.controls.up = true;
        if (e.key === 's' || e.key === 'S') player1.controls.down = true;
        if (e.key === 'a' || e.key === 'A') player1.controls.left = true;
        if (e.key === 'd' || e.key === 'D') player1.controls.right = true;
        if (e.key === ' ') player1.controls.shoot = true;
        
        // Player 2 controls (Arrow keys + Enter)
        if (e.key === 'ArrowUp') player2.controls.up = true;
        if (e.key === 'ArrowDown') player2.controls.down = true;
        if (e.key === 'ArrowLeft') player2.controls.left = true;
        if (e.key === 'ArrowRight') player2.controls.right = true;
        if (e.key === 'Enter') player2.controls.shoot = true;
    }
    
    function handleKeyUp(e) {
        // Player 1 controls
        if (e.key === 'w' || e.key === 'W') player1.controls.up = false;
        if (e.key === 's' || e.key === 'S') player1.controls.down = false;
        if (e.key === 'a' || e.key === 'A') player1.controls.left = false;
        if (e.key === 'd' || e.key === 'D') player1.controls.right = false;
        if (e.key === ' ') player1.controls.shoot = false;
        
        // Player 2 controls
        if (e.key === 'ArrowUp') player2.controls.up = false;
        if (e.key === 'ArrowDown') player2.controls.down = false;
        if (e.key === 'ArrowLeft') player2.controls.left = false;
        if (e.key === 'ArrowRight') player2.controls.right = false;
        if (e.key === 'Enter') player2.controls.shoot = false;
    }
    
    // Move players based on controls
    function movePlayers() {
        // Player 1 movement
        if (player1.controls.up) {
            const radians = player1.rotation * Math.PI / 180;
            player1.x += Math.sin(radians) * player1.speed;
            player1.y -= Math.cos(radians) * player1.speed;
        }
        if (player1.controls.down) {
            const radians = player1.rotation * Math.PI / 180;
            player1.x -= Math.sin(radians) * player1.speed;
            player1.y += Math.cos(radians) * player1.speed;
        }
        if (player1.controls.left) {
            player1.rotation -= player1.rotationSpeed;
        }
        if (player1.controls.right) {
            player1.rotation += player1.rotationSpeed;
        }
        if (player1.controls.shoot) {
            createBullet(player1, 1);
        }
        
        // Player 2 movement
        if (player2.controls.up) {
            const radians = player2.rotation * Math.PI / 180;
            player2.x += Math.sin(radians) * player2.speed;
            player2.y -= Math.cos(radians) * player2.speed;
        }
        if (player2.controls.down) {
            const radians = player2.rotation * Math.PI / 180;
            player2.x -= Math.sin(radians) * player2.speed;
            player2.y += Math.cos(radians) * player2.speed;
        }
        if (player2.controls.left) {
            player2.rotation -= player2.rotationSpeed;
        }
        if (player2.controls.right) {
            player2.rotation += player2.rotationSpeed;
        }
        if (player2.controls.shoot) {
            createBullet(player2, 2);
        }
        
        // Keep players within bounds
        player1.x = Math.max(player1.width/2, Math.min(gameWidth - player1.width/2, player1.x));
        player1.y = Math.max(player1.height/2, Math.min(gameHeight - player1.height/2, player1.y));
        player2.x = Math.max(player2.width/2, Math.min(gameWidth - player2.width/2, player2.x));
        player2.y = Math.max(player2.height/2, Math.min(gameHeight - player2.height/2, player2.y));
        
        updateShipPosition(player1);
        updateShipPosition(player2);
        updateShieldPosition(player1);
        updateShieldPosition(player2);
    }
    
    // End the round
    function endRound(winner) {
        gameRunning = false;
        clearInterval(gameLoop);
        clearInterval(powerUpTimer);
        
        if (winner === 'Player 1') {
            player1Score++;
            player1ScoreElement.textContent = player1Score;
            winnerText.textContent = 'Player 1 Wins!';
            winnerText.className = 'winner-text text-2xl md:text-3xl font-bold mb-8 text-blue-500';
        } else {
            player2Score++;
            player2ScoreElement.textContent = player2Score;
            winnerText.textContent = 'Player 2 Wins!';
            winnerText.className = 'winner-text text-2xl md:text-3xl font-bold mb-8 text-red-500';
        }
        
        // Create large explosion at loser's position
        if (winner === 'Player 1') {
            createExplosion(player2.x, player2.y, 'large', player2.skin.color);
        } else {
            createExplosion(player1.x, player1.y, 'large', player1.skin.color);
        }
        
        // Show game over screen after a short delay
        setTimeout(() => {
            gameOverScreen.style.display = 'flex';
        }, 1500);
    }
    
    // Start a new round
    function startRound() {
        // Update game dimensions
        updateGameDimensions();
        
        // Clear game area
        while (gameArea.firstChild) {
            gameArea.removeChild(gameArea.firstChild);
        }
        
        // Reset player positions and health
        player1.x = gameWidth * 0.25;
        player1.y = gameHeight / 2;
        player1.rotation = 0;
        player1.health = 100;
        player1.bullets = [];
        player1.shield.active = false;
        player1.speedBoost.active = false;
        player1.speed = 5;
        
        player2.x = gameWidth * 0.75;
        player2.y = gameHeight / 2;
        player2.rotation = 180;
        player2.health = 100;
        player2.bullets = [];
        player2.shield.active = false;
        player2.speedBoost.active = false;
        player2.speed = 5;
        
        // Reset health bars
        healthBar1.style.width = '100%';
        healthBar2.style.width = '100%';
        
        // Clear power-ups
        powerUps = [];
        
        // Create game elements
        const gameGrid = document.createElement('div');
        gameGrid.className = 'game-grid';
        gameArea.appendChild(gameGrid);
        
        createStars();
        createSpaceships();
        
        // Start game loop
        gameRunning = true;
        gameLoop = setInterval(gameUpdate, 1000 / 60); // 60 FPS
        
        // Start power-up spawning
        powerUpTimer = setInterval(createPowerUp, powerUpSpawnInterval);
        
        // Hide overlays
        startScreen.style.display = 'none';
        skinSelectionScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
    }
    
    // Game update function (called every frame)
    function gameUpdate() {
        movePlayers();
        moveBullets();
        checkPowerUpCollisions();
    }
    
    // Initialize skin selection
    function initSkinSelection() {
        // Clear previous skin options
        player1SkinGrid.innerHTML = '';
        player2SkinGrid.innerHTML = '';
        
        // Create skin options for player 1
        shipSkins.forEach((skin, index) => {
            const skinOption = document.createElement('div');
            skinOption.className = 'skin-option';
            skinOption.style.backgroundColor = skin.secondaryColor;
            skinOption.innerHTML = skin.svg;
            skinOption.dataset.index = index;
            
            // Add skin name
            const skinName = document.createElement('div');
            skinName.className = 'skin-name';
            skinName.textContent = skin.name;
            skinOption.appendChild(skinName);
            
            // Add click event
            skinOption.addEventListener('click', () => {
                // Remove selected class from all options
                const options = player1SkinGrid.querySelectorAll('.skin-option');
                options.forEach(opt => opt.classList.remove('selected', 'just-selected'));
                
                // Add selected class to clicked option
                skinOption.classList.add('selected', 'just-selected');
                setTimeout(() => {
                    skinOption.classList.remove('just-selected');
                }, 500);
                
                // Update player skin
                player1.skin = shipSkins[index];
                updateSkinPreview(player1, player1Preview);
            });
            
            player1SkinGrid.appendChild(skinOption);
            
            // Select default skin
            if (index === 1) { // Water skin
                skinOption.classList.add('selected');
            }
        });
        
        // Create skin options for player 2
        shipSkins.forEach((skin, index) => {
            const skinOption = document.createElement('div');
            skinOption.className = 'skin-option';
            skinOption.style.backgroundColor = skin.secondaryColor;
            skinOption.innerHTML = skin.svg;
            skinOption.dataset.index = index;
            
            // Add skin name
            const skinName = document.createElement('div');
            skinName.className = 'skin-name';
            skinName.textContent = skin.name;
            skinOption.appendChild(skinName);
            
            // Add click event
            skinOption.addEventListener('click', () => {
                // Remove selected class from all options
                const options = player2SkinGrid.querySelectorAll('.skin-option');
                options.forEach(opt => opt.classList.remove('selected', 'just-selected'));
                
                // Add selected class to clicked option
                skinOption.classList.add('selected', 'just-selected');
                setTimeout(() => {
                    skinOption.classList.remove('just-selected');
                }, 500);
                
                // Update player skin
                player2.skin = shipSkins[index];
                updateSkinPreview(player2, player2Preview);
            });
            
            player2SkinGrid.appendChild(skinOption);
            
            // Select default skin
            if (index === 0) { // Fire skin
                skinOption.classList.add('selected');
            }
        });
        
        // Update skin previews
        updateSkinPreview(player1, player1Preview);
        updateSkinPreview(player2, player2Preview);
        
        // Reset ready states
        player1Ready = false;
        player2Ready = false;
        player1ReadyIndicator.classList.remove('active');
        player2ReadyIndicator.classList.remove('active');
        startGameBtn.classList.remove('active');
    }
    
    // Update skin preview
    function updateSkinPreview(player, previewElement) {
        previewElement.innerHTML = '';
        const previewSVG = document.createElement('div');
        previewSVG.innerHTML = player.skin.svg;
        previewSVG.style.color = player.skin.color;
        previewElement.appendChild(previewSVG);
    }
    
    // Show skin selection screen
    function showSkinSelection() {
        startScreen.style.display = 'none';
        skinSelectionScreen.style.display = 'flex';
        initSkinSelection();
    }
    
    // Event listeners
    startSelectionBtn.addEventListener('click', showSkinSelection);
    startGameBtn.addEventListener('click', startRound);
    playAgainBtn.addEventListener('click', startRound);
    changeShipsBtn.addEventListener('click', showSkinSelection);
    
    player1ReadyBtn.addEventListener('click', () => {
        player1Ready = !player1Ready;
        player1ReadyIndicator.classList.toggle('active', player1Ready);
        checkBothPlayersReady();
    });
    
    player2ReadyBtn.addEventListener('click', () => {
        player2Ready = !player2Ready;
        player2ReadyIndicator.classList.toggle('active', player2Ready);
        checkBothPlayersReady();
    });
    
    function checkBothPlayersReady() {
        if (player1Ready && player2Ready) {
            startGameBtn.classList.add('active');
        } else {
            startGameBtn.classList.remove('active');
        }
    }
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Prevent scrolling with arrow keys
    window.addEventListener('keydown', function(e) {
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);


    if (/Mobi|Android/i.test(navigator.userAgent)) {
        alert("This game is best played on desktop with a keyboard!");
      }
    
    // Initialize sounds
    initSounds();



});
