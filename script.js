/* ========================================
   Flappy Bird - Основная логика игры
   ======================================== */

// ========== КОНФИГУРАЦИЯ ==========
const CONFIG = {
    // Размеры canvas
    canvasWidth: 400,
    canvasHeight: 600,
    
    // Параметры птицы
    bird: {
        x: 60,
        y: 150,
        width: 30,
        height: 24,
        gravity: 0.6,
        jumpPower: -8,
        maxFallSpeed: 12
    },
    
    // Параметры препятствий
    pipes: {
        width: 50,
        gap: 150,
        distance: 300,
        speed: 5,
        minHeight: 50,
        maxHeight: 300
    },
    
    // Прочие параметры
    groundHeight: 60,
    fps: 60
};

// ========== ПЕРЕМЕННЫЕ СОСТОЯНИЯ ==========
let gameState = {
    isRunning: true,
    isPaused: false,
    score: 0,
    gameOver: false,
    bird: {
        x: CONFIG.bird.x,
        y: CONFIG.bird.y,
        velocityY: 0
    },
    pipes: [],
    nextPipeId: 0,
    frameCount: 0,
    lastPipeDistance: 0
};

// ========== ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ DOM ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// ========== СОБЫТИЯ УПРАВЛЕНИЯ ==========
// Управление мышью и сенсорным экраном
document.addEventListener('click', handleFlap);
document.addEventListener('touchstart', handleFlap);
canvas.addEventListener('click', handleFlap);
canvas.addEventListener('touchstart', handleFlap);

// Управление клавиатурой (пробел)
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        handleFlap();
    }
});

// Кнопка "Играть снова"
restartButton.addEventListener('click', restartGame);

/**
 * Обработчик прыжка птицы
 */
function handleFlap(e) {
    if (e) {
        e.preventDefault();
    }
    
    if (gameState.gameOver) {
        return; // Игра закончена, ждем перезапуска
    }
    
    if (!gameState.isRunning) {
        return;
    }
    
    // Применяем импульс вверх
    gameState.bird.velocityY = CONFIG.bird.jumpPower;
}

// ========== ОСНОВНОЙ ИГРОВОЙ ЦИКЛ ==========
/**
 * Главная функция обновления игры
 */
function update() {
    if (!gameState.isRunning || gameState.isPaused) {
        return;
    }
    
    // Обновление птицы
    updateBird();
    
    // Обновление препятствий
    updatePipes();
    
    // Проверка столкновений
    checkCollisions();
    
    // Обновление счета
    updateScore();
}

/**
 * Обновление состояния птицы
 */
function updateBird() {
    // Применение гравитации
    gameState.bird.velocityY += CONFIG.bird.gravity;
    
    // Ограничение максимальной скорости падения
    if (gameState.bird.velocityY > CONFIG.bird.maxFallSpeed) {
        gameState.bird.velocityY = CONFIG.bird.maxFallSpeed;
    }
    
    // Обновление позиции
    gameState.bird.y += gameState.bird.velocityY;
}

/**
 * Обновление препятствий
 */
function updatePipes() {
    // Движение существующих труб
    for (let i = gameState.pipes.length - 1; i >= 0; i--) {
        gameState.pipes[i].x -= CONFIG.pipes.speed;
        
        // Удаление труб, вышедших за пределы экрана
        if (gameState.pipes[i].x + CONFIG.pipes.width < 0) {
            gameState.pipes.splice(i, 1);
        }
    }
    
    gameState.lastPipeDistance += CONFIG.pipes.speed;
    
    // Создание новых труб
    if (gameState.lastPipeDistance >= CONFIG.pipes.distance) {
        createPipe();
        gameState.lastPipeDistance = 0;
    }
}

/**
 * Создание новой пары труб
 */
function createPipe() {
    const gapTop = Math.random() * (CONFIG.pipes.maxHeight - CONFIG.pipes.minHeight) + CONFIG.pipes.minHeight;
    const gapBottom = CONFIG.canvasHeight - CONFIG.groundHeight - gapTop - CONFIG.pipes.gap;
    
    // Верхняя труба
    gameState.pipes.push({
        id: gameState.nextPipeId++,
        x: CONFIG.canvasWidth,
        y: 0,
        height: gapTop,
        type: 'top',
        scored: false
    });
    
    // Нижняя труба
    gameState.pipes.push({
        id: gameState.nextPipeId++,
        x: CONFIG.canvasWidth,
        y: CONFIG.canvasHeight - CONFIG.groundHeight - gapBottom,
        height: gapBottom,
        type: 'bottom',
        scored: false
    });
}

/**
 * Проверка столкновений
 */
function checkCollisions() {
    const bird = gameState.bird;
    
    // Столкновение с землей
    if (bird.y + CONFIG.bird.height >= CONFIG.canvasHeight - CONFIG.groundHeight) {
        endGame();
        return;
    }
    
    // Столкновение с потолком
    if (bird.y <= 0) {
        endGame();
        return;
    }
    
    // Столкновение с трубами
    for (let pipe of gameState.pipes) {
        if (isColliding(bird, pipe)) {
            endGame();
            return;
        }
    }
}

/**
 * Проверка столкновения птицы с трубой
 */
function isColliding(bird, pipe) {
    // Если птица слишком далеко влево или вправо от трубы
    if (bird.x + CONFIG.bird.width <= pipe.x || bird.x >= pipe.x + CONFIG.pipes.width) {
        return false;
    }
    
    // Если птица находится в зоне трубы
    if (bird.y <= pipe.y + pipe.height && bird.y + CONFIG.bird.height >= pipe.y) {
        return true;
    }
    
    return false;
}

/**
 * Обновление счета
 */
function updateScore() {
    for (let pipe of gameState.pipes) {
        // Если птица прошла через трубу и это еще не зафиксировано
        if (!pipe.scored && pipe.x + CONFIG.pipes.width < gameState.bird.x) {
            pipe.scored = true;
            // Увеличиваем счет только для одной трубы пары
            if (pipe.type === 'bottom') {
                gameState.score++;
                scoreDisplay.textContent = gameState.score;
                
                // TODO: Интеграция с Яндекс Играми
                // window.YaGame.submitScore(gameState.score);
            }
        }
    }
}

// ========== РИСОВАНИЕ ==========
/**
 * Главная функция отрисовки
 */
function draw() {
    // Очистка canvas
    ctx.fillStyle = 'linear-gradient-to-bottom, #87CEEB 0%, #E0F6FF 100%';
    ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
    
    // Рисование фона (небо)
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvasHeight - CONFIG.groundHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight - CONFIG.groundHeight);
    
    // Рисование облаков
    drawClouds();
    
    // Рисование земли
    drawGround();
    
    // Рисование птицы
    drawBird();
    
    // Рисование труб
    drawPipes();
}

/**
 * Рисование облаков
 */
function drawClouds() {
    const cloudY1 = 50 + Math.sin(gameState.frameCount * 0.01) * 5;
    const cloudY2 = 120 + Math.sin(gameState.frameCount * 0.008 + Math.PI) * 5;
    
    drawCloud(80, cloudY1, 30);
    drawCloud(320, cloudY2, 35);
}

/**
 * Вспомогательная функция рисования облака
 */
function drawCloud(x, y, size) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size, y - size / 2, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 2, y, size, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Рисование земли
 */
function drawGround() {
    // Трава
    ctx.fillStyle = '#2d8659';
    ctx.fillRect(0, CONFIG.canvasHeight - CONFIG.groundHeight, CONFIG.canvasWidth, CONFIG.groundHeight);
    
    // Линия земли
    ctx.strokeStyle = '#1a5033';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.canvasHeight - CONFIG.groundHeight);
    ctx.lineTo(CONFIG.canvasWidth, CONFIG.canvasHeight - CONFIG.groundHeight);
    ctx.stroke();
}

/**
 * Рисование птицы
 */
function drawBird() {
    const bird = gameState.bird;
    
    // Угол поворота в зависимости от скорости падения
    const angle = Math.min(Math.max(bird.velocityY / 10, -0.5), 0.5);
    
    ctx.save();
    ctx.translate(bird.x + CONFIG.bird.width / 2, bird.y + CONFIG.bird.height / 2);
    ctx.rotate(angle);
    
    // Тело
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-CONFIG.bird.width / 2, -CONFIG.bird.height / 2, CONFIG.bird.width, CONFIG.bird.height);
    
    // Крыло
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(-CONFIG.bird.width / 4, -CONFIG.bird.height / 3, CONFIG.bird.width / 3, CONFIG.bird.height / 6);
    
    // Глаз
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(CONFIG.bird.width / 6, -CONFIG.bird.height / 6, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(CONFIG.bird.width / 6 + 1, -CONFIG.bird.height / 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Клюв
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.moveTo(CONFIG.bird.width / 3, -CONFIG.bird.height / 8);
    ctx.lineTo(CONFIG.bird.width / 3 + 8, -CONFIG.bird.height / 8);
    ctx.lineTo(CONFIG.bird.width / 3, CONFIG.bird.height / 8);
    ctx.fill();
    
    ctx.restore();
}

/**
 * Рисование труб
 */
function drawPipes() {
    for (let pipe of gameState.pipes) {
        // Цвет трубы
        ctx.fillStyle = '#2d8659';
        
        // Рисование трубы
        ctx.fillRect(pipe.x, pipe.y, CONFIG.pipes.width, pipe.height);
        
        // Кант трубы
        ctx.strokeStyle = '#1a5033';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, pipe.y, CONFIG.pipes.width, pipe.height);
    }
}

// ========== УПРАВЛЕНИЕ ИГРОЙ ==========
/**
 * Завершение игры
 */
function endGame() {
    gameState.gameOver = true;
    gameState.isRunning = false;
    
    // Показываем экран Game Over
    gameOverScreen.style.display = 'flex';
    finalScoreDisplay.textContent = gameState.score;
    
    // TODO: Интеграция с Яндекс Играми
    // window.YaGame.save({ score: gameState.score });
    // window.YaGame.showAd(() => {
    //     console.log('Ad finished');
    // });
}

/**
 * Перезапуск игры
 */
function restartGame() {
    gameState = {
        isRunning: true,
        isPaused: false,
        score: 0,
        gameOver: false,
        bird: {
            x: CONFIG.bird.x,
            y: CONFIG.bird.y,
            velocityY: 0
        },
        pipes: [],
        nextPipeId: 0,
        frameCount: 0,
        lastPipeDistance: CONFIG.pipes.distance - 100
    };
    
    scoreDisplay.textContent = '0';
    gameOverScreen.style.display = 'none';
}

// ========== ОСНОВНОЙ ЦИКЛ ИГРЫ ==========
/**
 * Главный игровой цикл (60 FPS)
 */
let lastFrameTime = performance.now();

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    // Обновление
    update();
    
    // Отрисовка
    draw();
    
    // Увеличение счетчика кадров
    gameState.frameCount++;
    
    // Запрос следующего кадра
    requestAnimationFrame(gameLoop);
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
/**
 * Инициализация игры
 */
function init() {
    console.log('Flappy Bird Game Initialized');
    console.log('Canvas size:', CONFIG.canvasWidth, 'x', CONFIG.canvasHeight);
    
    // Начинаем игровой цикл
    requestAnimationFrame(gameLoop);
}

// Запуск игры при загрузке страницы
window.addEventListener('DOMContentLoaded', init);
