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
    lastPipeDistance: 0,
    currentSkin: 'yellow',
    maxScore: localStorage.getItem('maxScore') ? parseInt(localStorage.getItem('maxScore')) : 0,
    achievements: {
        ach1: localStorage.getItem('ach1') ? JSON.parse(localStorage.getItem('ach1')) : false,
        ach2: localStorage.getItem('ach2') ? JSON.parse(localStorage.getItem('ach2')) : false,
        ach3: localStorage.getItem('ach3') ? JSON.parse(localStorage.getItem('ach3')) : false,
        ach4: localStorage.getItem('ach4') ? JSON.parse(localStorage.getItem('ach4')) : false
    }
};

// ========== ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ DOM ==========
// Меню
const mainMenu = document.getElementById('mainMenu');
const playButton = document.getElementById('playButton');
const achievementsButton = document.getElementById('achievementsButton');
const skinsButton = document.getElementById('skinsButton');

// Игра
const gameView = document.getElementById('gameView');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const exitButton = document.getElementById('exitButton');
const backButton = document.getElementById('backButton');

// Достижения
const achievementsView = document.getElementById('achievementsView');
const closeAchievements = document.getElementById('closeAchievements');

// Скины
const skinsView = document.getElementById('skinsView');
const closeSkins = document.getElementById('closeSkins');
const skinButtons = document.querySelectorAll('.skin-button');

// ========== СОБЫТИЯ МЕНЮ ==========
playButton.addEventListener('click', startGame);
achievementsButton.addEventListener('click', showAchievements);
skinsButton.addEventListener('click', showSkins);
backButton.addEventListener('click', backToMenu);
closeAchievements.addEventListener('click', backToMenu);
closeSkins.addEventListener('click', backToMenu);
exitButton.addEventListener('click', backToMenu);

// Обработчики для выбора скинов
skinButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        selectSkin(index + 1);
    });
});

// ========== ФУНКЦИИ НАВИГАЦИИ ==========
function startGame() {
    mainMenu.style.display = 'none';
    gameView.style.display = 'block';
    resetGame();
    gameState.isRunning = true;
}

function backToMenu() {
    gameView.style.display = 'none';
    achievementsView.style.display = 'none';
    skinsView.style.display = 'none';
    mainMenu.style.display = 'flex';
    gameState.isRunning = false;
    gameOverScreen.style.display = 'none';
}

function showAchievements() {
    mainMenu.style.display = 'none';
    achievementsView.style.display = 'block';
    updateAchievementsDisplay();
}

function showSkins() {
    mainMenu.style.display = 'none';
    skinsView.style.display = 'block';
    updateSkinsDisplay();
}

// ========== ФУНКЦИИ ДОСТИЖЕНИЙ ==========
function updateAchievementsDisplay() {
    const achievements = [
        { id: 'ach1', score: 5 },
        { id: 'ach2', score: 10 },
        { id: 'ach3', score: 25 },
        { id: 'ach4', score: 50 }
    ];

    achievements.forEach(ach => {
        const element = document.getElementById(ach.id);
        if (gameState.achievements[ach.id]) {
            element.textContent = 'Получено ✓';
            element.classList.add('unlocked');
            element.style.background = 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)';
            element.style.color = 'white';
        } else {
            element.textContent = 'Заблокировано';
            element.classList.remove('unlocked');
        }
    });
}

function checkAchievements() {
    if (gameState.score >= 5 && !gameState.achievements.ach1) {
        gameState.achievements.ach1 = true;
        localStorage.setItem('ach1', JSON.stringify(true));
    }
    if (gameState.score >= 10 && !gameState.achievements.ach2) {
        gameState.achievements.ach2 = true;
        localStorage.setItem('ach2', JSON.stringify(true));
    }
    if (gameState.score >= 25 && !gameState.achievements.ach3) {
        gameState.achievements.ach3 = true;
        localStorage.setItem('ach3', JSON.stringify(true));
    }
    if (gameState.score >= 50 && !gameState.achievements.ach4) {
        gameState.achievements.ach4 = true;
        localStorage.setItem('ach4', JSON.stringify(true));
    }
}

// ========== ФУНКЦИИ СКИНОВ ==========
function updateSkinsDisplay() {
    const skinItems = document.querySelectorAll('.skin-item');
    skinItems.forEach((item, index) => {
        if (index === 0) {
            if (gameState.currentSkin === 'yellow') {
                item.classList.add('selected');
                item.querySelector('.skin-status').textContent = 'Активна';
            } else {
                item.classList.remove('selected');
                item.querySelector('.skin-status').textContent = '';
            }
        } else {
            item.classList.remove('selected');
        }
    });
}

function selectSkin(skinIndex) {
    const skins = ['yellow', 'red', 'blue', 'purple'];
    gameState.currentSkin = skins[skinIndex - 1];
    localStorage.setItem('currentSkin', gameState.currentSkin);
    
    // Обновляем UI
    const skinItems = document.querySelectorAll('.skin-item');
    skinItems.forEach((item, index) => {
        if (index === skinIndex - 1) {
            item.classList.add('selected');
            const statusElement = item.querySelector('.skin-status');
            if (statusElement) {
                statusElement.textContent = 'Активна';
            } else {
                const info = item.querySelector('.skin-info');
                const status = document.createElement('p');
                status.className = 'skin-status';
                status.textContent = 'Активна';
                info.appendChild(status);
            }
            const button = item.querySelector('.skin-button');
            if (button) button.style.display = 'none';
        } else {
            item.classList.remove('selected');
            const statusElement = item.querySelector('.skin-status');
            if (statusElement) statusElement.remove();
            const button = item.querySelector('.skin-button');
            if (button) button.style.display = 'block';
        }
    });
}

// ========== СОБЫТИЯ УПРАВЛЕНИЯ ИГРОЙ ==========
// Управление мышью и сенсорным экраном
document.addEventListener('click', handleFlap);
document.addEventListener('touchstart', handleFlap);
canvas.addEventListener('click', handleFlap);
canvas.addEventListener('touchstart', handleFlap);

// Управление клавиатурой (пробел)
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && gameView.style.display !== 'none') {
        event.preventDefault();
        handleFlap();
    }
});

// Кнопка "Играть снова"
restartButton.addEventListener('click', function() {
    gameOverScreen.style.display = 'none';
    resetGame();
    gameState.isRunning = true;
});

/**
 * Обработчик прыжка птицы
 */
function handleFlap(e) {
    if (e && e.preventDefault) {
        // Не прерываем события в меню
        if (mainMenu.style.display !== 'none' || 
            achievementsView.style.display !== 'none' || 
            skinsView.style.display !== 'none') {
            return;
        }
        e.preventDefault();
    }
    
    if (gameState.gameOver) {
        return; // Игра закончена, ждем перезапуска
    }
    
    if (!gameState.isRunning || gameView.style.display === 'none') {
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
    
    // Проверка достижений
    checkAchievements();
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
                
                // Обновляем максимальный счет
                if (gameState.score > gameState.maxScore) {
                    gameState.maxScore = gameState.score;
                    localStorage.setItem('maxScore', gameState.maxScore);
                }
                
                // TODO: Ин��еграция с Яндекс Играми
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
    
    // Выбор цвета в зависимости от скина
    let bodyColor, wingColor, beakColor;
    
    switch(gameState.currentSkin) {
        case 'red':
            bodyColor = '#FF4444';
            wingColor = '#CC0000';
            beakColor = '#FF6B6B';
            break;
        case 'blue':
            bodyColor = '#4488FF';
            wingColor = '#0055CC';
            beakColor = '#66B3FF';
            break;
        case 'purple':
            bodyColor = '#AA44FF';
            wingColor = '#7700DD';
            beakColor = '#CC88FF';
            break;
        default: // yellow
            bodyColor = '#FFD700';
            wingColor = '#FFA500';
            beakColor = '#FF6B6B';
    }
    
    // Угол поворота в зависимости от скорости падения
    const angle = Math.min(Math.max(bird.velocityY / 10, -0.5), 0.5);
    
    ctx.save();
    ctx.translate(bird.x + CONFIG.bird.width / 2, bird.y + CONFIG.bird.height / 2);
    ctx.rotate(angle);
    
    // Тело
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-CONFIG.bird.width / 2, -CONFIG.bird.height / 2, CONFIG.bird.width, CONFIG.bird.height);
    
    // Крыло
    ctx.fillStyle = wingColor;
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
    ctx.fillStyle = beakColor;
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
    
    // Проверяем достижения перед завершением
    checkAchievements();
    
    // TODO: Интеграция с Яндекс Играми
    // window.YaGame.save({ score: gameState.score });
    // window.YaGame.showAd(() => {
    //     console.log('Ad finished');
    // });
}

/**
 * Перезапуск игры
 */
function resetGame() {
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
        lastPipeDistance: CONFIG.pipes.distance - 100,
        currentSkin: localStorage.getItem('currentSkin') || 'yellow',
        maxScore: gameState.maxScore,
        achievements: gameState.achievements
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
    
    // Загружаем сохраненный скин
    const savedSkin = localStorage.getItem('currentSkin');
    if (savedSkin) {
        gameState.currentSkin = savedSkin;
    }
    
    // Начинаем игровой цикл
    requestAnimationFrame(gameLoop);
}

// Запуск игры при загрузке страницы
window.addEventListener('DOMContentLoaded', init);