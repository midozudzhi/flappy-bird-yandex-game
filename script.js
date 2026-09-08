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

// ========== КОНФИГУРАЦИЯ ТЕМ И ДОСТИЖЕНИЙ ==========
const THEMES = {
    yellow: {
        name: 'Жёлтая птица',
        type: 'skin',
        cost: 0,
        unlocked: true,
        sky: '#87CEEB',
        ground: '#2d8659',
        groundLine: '#1a5033',
        hasTrail: false
    },
    red: {
        name: 'Красная птица',
        type: 'skin',
        cost: 0,
        unlocked: true,
        sky: '#87CEEB',
        ground: '#2d8659',
        groundLine: '#1a5033',
        hasTrail: false
    },
    blue: {
        name: 'Голубая птица',
        type: 'skin',
        cost: 0,
        unlocked: true,
        sky: '#87CEEB',
        ground: '#2d8659',
        groundLine: '#1a5033',
        hasTrail: false
    },
    purple: {
        name: 'Фиолетовая птица',
        type: 'skin',
        cost: 0,
        unlocked: true,
        sky: '#87CEEB',
        ground: '#2d8659',
        groundLine: '#1a5033',
        hasTrail: false
    },
    fire: {
        name: 'Огненная птица',
        type: 'skin',
        cost: 200,
        unlocked: false,
        sky: '#FF6B00',
        ground: '#660000',
        groundLine: '#330000',
        hasTrail: true,
        trailColor: '#FF4500'
    },
    desert: {
        name: 'Пустыня',
        type: 'theme',
        cost: 50,
        unlocked: false,
        sky: '#FFD700',
        ground: '#D4A574',
        groundLine: '#B8860B',
        hasTrail: false
    },
    jungle: {
        name: 'Джунгли',
        type: 'theme',
        cost: 75,
        unlocked: false,
        sky: '#90EE90',
        ground: '#228B22',
        groundLine: '#0B6623',
        hasTrail: false
    },
    ocean: {
        name: 'Море',
        type: 'theme',
        cost: 100,
        unlocked: false,
        sky: '#4A90E2',
        ground: '#1E90FF',
        groundLine: '#000080',
        hasTrail: false
    }
};

const ACHIEVEMENTS = {
    ach1: { id: 'ach1', score: 5, reward: 10 },
    ach2: { id: 'ach2', score: 10, reward: 25 },
    ach3: { id: 'ach3', score: 25, reward: 50 },
    ach4: { id: 'ach4', score: 50, reward: 100 }
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
        velocityY: 0,
        trail: []
    },
    pipes: [],
    nextPipeId: 0,
    frameCount: 0,
    lastPipeDistance: 0,
    currentSkin: 'yellow',
    currentTheme: 'yellow',
    maxScore: localStorage.getItem('maxScore') ? parseInt(localStorage.getItem('maxScore')) : 0,
    crystals: localStorage.getItem('crystals') ? parseInt(localStorage.getItem('crystals')) : 0,
    achievements: {
        ach1: localStorage.getItem('ach1') ? JSON.parse(localStorage.getItem('ach1')) : false,
        ach2: localStorage.getItem('ach2') ? JSON.parse(localStorage.getItem('ach2')) : false,
        ach3: localStorage.getItem('ach3') ? JSON.parse(localStorage.getItem('ach3')) : false,
        ach4: localStorage.getItem('ach4') ? JSON.parse(localStorage.getItem('ach4')) : false
    },
    unlockedThemes: {
        yellow: true,
        red: true,
        blue: true,
        purple: true,
        fire: localStorage.getItem('theme_fire') ? JSON.parse(localStorage.getItem('theme_fire')) : false,
        desert: localStorage.getItem('theme_desert') ? JSON.parse(localStorage.getItem('theme_desert')) : false,
        jungle: localStorage.getItem('theme_jungle') ? JSON.parse(localStorage.getItem('theme_jungle')) : false,
        ocean: localStorage.getItem('theme_ocean') ? JSON.parse(localStorage.getItem('theme_ocean')) : false
    }
};

// ========== ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ DOM ==========
// Меню
const mainMenu = document.getElementById('mainMenu');
const playButton = document.getElementById('playButton');
const achievementsButton = document.getElementById('achievementsButton');
const skinsButton = document.getElementById('skinsButton');
const crystalsDisplay = document.getElementById('crystalsDisplay');

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
document.addEventListener('DOMContentLoaded', () => {
    const updatedSkinButtons = document.querySelectorAll('.skin-button');
    updatedSkinButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const themeId = button.dataset.theme;
            handleThemeSelection(themeId);
        });
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
    updateCrystalsDisplay();
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
        { id: 'ach1', score: 5, reward: 10 },
        { id: 'ach2', score: 10, reward: 25 },
        { id: 'ach3', score: 25, reward: 50 },
        { id: 'ach4', score: 50, reward: 100 }
    ];

    achievements.forEach(ach => {
        const element = document.getElementById(ach.id);
        const rewardElement = document.getElementById(ach.id + '-reward');
        
        if (gameState.achievements[ach.id]) {
            element.textContent = 'Получено ✓';
            element.classList.add('unlocked');
            element.style.background = 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)';
            element.style.color = 'white';
            if (rewardElement) {
                rewardElement.style.display = 'inline';
            }
        } else {
            element.textContent = 'Заблокировано';
            element.classList.remove('unlocked');
            if (rewardElement) {
                rewardElement.style.display = 'none';
            }
        }
    });
}

function checkAchievements() {
    Object.keys(ACHIEVEMENTS).forEach(achKey => {
        const ach = ACHIEVEMENTS[achKey];
        if (gameState.score >= ach.score && !gameState.achievements[achKey]) {
            gameState.achievements[achKey] = true;
            gameState.crystals += ach.reward;
            localStorage.setItem(achKey, JSON.stringify(true));
            localStorage.setItem('crystals', gameState.crystals);
            
            // Показываем уведомление о получении кристаллов
            showCrystalsNotification(ach.reward);
        }
    });
}

function showCrystalsNotification(amount) {
    const notification = document.createElement('div');
    notification.className = 'crystal-notification';
    notification.textContent = `+${amount} 💎`;
    notification.style.position = 'fixed';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.fontSize = '2em';
    notification.style.fontWeight = 'bold';
    notification.style.color = '#FFD700';
    notification.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
    notification.style.zIndex = '2000';
    notification.style.animation = 'floatUp 2s ease-out forwards';
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// ========== ФУНКЦИИ ТЕМА И СКИНОВ ==========
function updateSkinsDisplay() {
    const skinsContainer = document.getElementById('skinsContainer');
    if (!skinsContainer) return;
    
    skinsContainer.innerHTML = '';
    
    Object.keys(THEMES).forEach(themeId => {
        const theme = THEMES[themeId];
        const isUnlocked = gameState.unlockedThemes[themeId];
        const isSelected = gameState.currentSkin === themeId;
        
        const skinItem = document.createElement('div');
        skinItem.className = `skin-item ${isSelected ? 'selected' : ''}`;
        
        let previewEmoji = '🐤';
        if (themeId === 'red') previewEmoji = '🔴';
        else if (themeId === 'blue') previewEmoji = '🔵';
        else if (themeId === 'purple') previewEmoji = '🟣';
        else if (themeId === 'fire') previewEmoji = '🔥';
        else if (themeId === 'desert') previewEmoji = '🏜️';
        else if (themeId === 'jungle') previewEmoji = '🌴';
        else if (themeId === 'ocean') previewEmoji = '🌊';
        
        let content = `
            <div class="skin-preview">
                ${previewEmoji}
            </div>
            <div class="skin-info">
                <h3>${theme.name}</h3>
        `;
        
        if (isSelected) {
            content += '<p class="skin-status">Активна ✓</p>';
        } else if (isUnlocked) {
            content += `<button class="skin-button" data-theme="${themeId}">Выбрать</button>`;
        } else {
            content += `<button class="skin-button skin-buy-button" data-theme="${themeId}">Купить за ${theme.cost} 💎</button>`;
        }
        
        content += '</div>';
        skinItem.innerHTML = content;
        skinsContainer.appendChild(skinItem);
    });
    
    // Переподключаем обработчики событий
    document.querySelectorAll('.skin-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const themeId = button.dataset.theme;
            handleThemeSelection(themeId);
        });
    });
}

function handleThemeSelection(themeId) {
    const theme = THEMES[themeId];
    const isUnlocked = gameState.unlockedThemes[themeId];
    
    if (!isUnlocked) {
        // Покупаем тему
        if (gameState.crystals >= theme.cost) {
            gameState.crystals -= theme.cost;
            gameState.unlockedThemes[themeId] = true;
            localStorage.setItem('crystals', gameState.crystals);
            localStorage.setItem(`theme_${themeId}`, JSON.stringify(true));
            
            // Показываем уведомление
            showNotification(`Тема "${theme.name}" разблокирована!`);
            updateSkinsDisplay();
            updateCrystalsDisplay();
        } else {
            showNotification(`Недостаточно кристаллов! Нужно ${theme.cost}, а у вас ${gameState.crystals}`);
        }
    } else {
        // Выбираем активную тему/скин
        gameState.currentSkin = themeId;
        gameState.currentTheme = themeId;
        localStorage.setItem('currentSkin', themeId);
        localStorage.setItem('currentTheme', themeId);
        updateSkinsDisplay();
    }
}

function updateCrystalsDisplay() {
    if (crystalsDisplay) {
        crystalsDisplay.textContent = gameState.crystals;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'rgba(0, 0, 0, 0.8)';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '2000';
    notification.style.fontSize = '0.9em';
    notification.style.maxWidth = '90%';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
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
    
    // Добавляем след для огненной птицы
    const theme = THEMES[gameState.currentTheme];
    if (theme && theme.hasTrail) {
        gameState.bird.trail.push({
            x: gameState.bird.x,
            y: gameState.bird.y,
            age: 0
        });
        
        // Очищаем старый след
        gameState.bird.trail = gameState.bird.trail.filter(point => {
            point.age++;
            return point.age < 10;
        });
    } else {
        gameState.bird.trail = [];
    }
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
    ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
    
    // Получаем текущую тему
    const theme = THEMES[gameState.currentTheme] || THEMES.yellow;
    
    // Рисование фона (небо)
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvasHeight - CONFIG.groundHeight);
    gradient.addColorStop(0, theme.sky);
    gradient.addColorStop(1, adjustBrightness(theme.sky, -20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight - CONFIG.groundHeight);
    
    // Рисование облаков/деталей в зависимости от темы
    drawThemeDetails(theme);
    
    // Рисование земли
    drawGround(theme);
    
    // Рисование птицы
    drawBird();
    
    // Рисование труб
    drawPipes(theme);
}

/**
 * Рисование деталей в зависимости от темы
 */
function drawThemeDetails(theme) {
    if (gameState.currentTheme === 'desert') {
        drawDesertDetails();
    } else if (gameState.currentTheme === 'jungle') {
        drawJungleDetails();
    } else if (gameState.currentTheme === 'ocean') {
        drawOceanDetails();
    } else if (gameState.currentTheme === 'fire') {
        drawFireDetails();
    } else {
        drawClouds();
    }
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
 * Рисование деталей пустыни
 */
function drawDesertDetails() {
    // Солнце
    ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(350, 50, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Дюны
    ctx.fillStyle = 'rgba(210, 180, 100, 0.3)';
    ctx.beginPath();
    ctx.arc(100, 300, 80, 0, Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(300, 350, 100, 0, Math.PI);
    ctx.fill();
}

/**
 * Рисование деталей джунглей
 */
function drawJungleDetails() {
    // Деревья слева
    ctx.fillStyle = 'rgba(34, 139, 34, 0.5)';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(30 + i * 80, 200 + i * 30, 60, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Деревья справа
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(350 - i * 80, 150 + i * 40, 50, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Листья летящие
    ctx.fillStyle = 'rgba(0, 200, 0, 0.4)';
    const leafY = 100 + Math.sin(gameState.frameCount * 0.02) * 50;
    ctx.beginPath();
    ctx.arc(200 + Math.cos(gameState.frameCount * 0.01) * 50, leafY, 8, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Рисование деталей моря
 */
function drawOceanDetails() {
    // Волны
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 3; i++) {
        const waveY = 100 + i * 80;
        ctx.beginPath();
        for (let x = 0; x < CONFIG.canvasWidth; x += 20) {
            const y = waveY + Math.sin((x + gameState.frameCount * 2) / 20) * 15;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    // Рыбка
    ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
    const fishX = 100 + Math.sin(gameState.frameCount * 0.01) * 50;
    const fishY = 250;
    ctx.beginPath();
    ctx.arc(fishX, fishY, 15, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Рисование деталей огня
 */
function drawFireDetails() {
    // Огневые частицы/языки пламени
    ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
    for (let i = 0; i < 3; i++) {
        const flameX = 50 + Math.sin(gameState.frameCount * 0.02 + i) * 30;
        const flameY = 100 + i * 80 + Math.cos(gameState.frameCount * 0.01 + i) * 20;
        ctx.beginPath();
        ctx.arc(flameX, flameY, 30 + Math.sin(gameState.frameCount * 0.03 + i) * 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Дополнительные языки пламени
    ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
    for (let i = 0; i < 2; i++) {
        const flameX = 350 - Math.cos(gameState.frameCount * 0.02 + i) * 30;
        const flameY = 150 + i * 100 + Math.sin(gameState.frameCount * 0.01 + i) * 25;
        ctx.beginPath();
        ctx.arc(flameX, flameY, 25 + Math.cos(gameState.frameCount * 0.03 + i) * 8, 0, Math.PI * 2);
        ctx.fill();
    }
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
function drawGround(theme) {
    // Земля/песок/вода
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, CONFIG.canvasHeight - CONFIG.groundHeight, CONFIG.canvasWidth, CONFIG.groundHeight);
    
    // Линия земли
    ctx.strokeStyle = theme.groundLine;
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
    const theme = THEMES[gameState.currentTheme];
    
    // Рисование следа для огненной птицы
    if (theme && theme.hasTrail && gameState.bird.trail.length > 0) {
        for (let i = 0; i < gameState.bird.trail.length; i++) {
            const point = gameState.bird.trail[i];
            const opacity = (1 - point.age / 10) * 0.6;
            ctx.fillStyle = `rgba(255, 69, 0, ${opacity})`;
            ctx.beginPath();
            ctx.arc(point.x + CONFIG.bird.width / 2, point.y + CONFIG.bird.height / 2, 6 - point.age / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
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
        case 'fire':
            bodyColor = '#FF2200';
            wingColor = '#CC0000';
            beakColor = '#FFAA00';
            break;
        default: // yellow и темы
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
function drawPipes(theme) {
    for (let pipe of gameState.pipes) {
        // Цвет трубы
        ctx.fillStyle = theme.ground;
        
        // Рисование трубы
        ctx.fillRect(pipe.x, pipe.y, CONFIG.pipes.width, pipe.height);
        
        // Кант трубы
        ctx.strokeStyle = theme.groundLine;
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, pipe.y, CONFIG.pipes.width, pipe.height);
    }
}

/**
 * Вспомогательная функция для изменения яркости цвета
 */
function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
        .toString(16).slice(1);
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
            velocityY: 0,
            trail: []
        },
        pipes: [],
        nextPipeId: 0,
        frameCount: 0,
        lastPipeDistance: CONFIG.pipes.distance - 100,
        currentSkin: localStorage.getItem('currentSkin') || 'yellow',
        currentTheme: localStorage.getItem('currentTheme') || 'yellow',
        maxScore: gameState.maxScore,
        crystals: gameState.crystals,
        achievements: gameState.achievements,
        unlockedThemes: gameState.unlockedThemes
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
    const savedTheme = localStorage.getItem('currentTheme');
    if (savedSkin) {
        gameState.currentSkin = savedSkin;
    }
    if (savedTheme) {
        gameState.currentTheme = savedTheme;
    }
    
    // Обновляем дисплей кристаллов
    updateCrystalsDisplay();
    
    // Начинаем игровой цикл
    requestAnimationFrame(gameLoop);
}

// Запуск игры при загрузке страницы
window.addEventListener('DOMContentLoaded', init);
