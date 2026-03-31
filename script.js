// 游戏常量
const GRID_SIZE = 20;
const CELL_SIZE = 20;

// 游戏变量
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 10 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = 0;
let gameInterval;
let gameRunning = false;
let difficulty = 'medium';
let soundEnabled = true;

// 速度设置
const speeds = {
    easy: 150,
    medium: 100,
    hard: 60
};

// 颜色设置
let snakeColors = ['#00ffff', '#00cccc', '#009999', '#006666'];
const foodColors = ['#ff9900', '#ffaa33', '#ffcc66', '#ffdd99'];

// 背景音乐
let backgroundMusic;

// 初始化音频
function initAudio() {
    // 创建音频对象
    backgroundMusic = new Audio('https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Robert_de_Bruce/Celestial_Thoughts/Robert_de_Bruce_-_01_-_Celestial_Thoughts.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
}

// DOM元素
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const difficultySelect = document.getElementById('difficulty-select');
const soundToggle = document.getElementById('sound-toggle');
const snakeColorPicker = document.getElementById('snake-color-picker');

// 保存蛇颜色
function saveSnakeColor() {
    localStorage.setItem('snakeGameColor', snakeColorPicker.value);
}

// 加载蛇颜色
function loadSnakeColor() {
    const savedColor = localStorage.getItem('snakeGameColor');
    if (savedColor) {
        snakeColorPicker.value = savedColor;
        updateSnakeColors(savedColor);
    }
}

// 更新蛇颜色
function updateSnakeColors(baseColor) {
    // 生成基于所选颜色的渐变
    const base = hexToRgb(baseColor);
    snakeColors = [
        baseColor,
        rgbToHex(base.r - 32, base.g - 32, base.b - 32),
        rgbToHex(base.r - 64, base.g - 64, base.b - 64),
        rgbToHex(base.r - 96, base.g - 96, base.b - 96)
    ];
    // 如果游戏正在运行，重新渲染
    if (gameRunning) {
        render();
    }
}

// 十六进制转RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 255, b: 255 };
}

// RGB转十六进制
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// 初始化游戏
function initGame() {
    // 加载最高分
    loadHighScore();
    
    // 加载蛇颜色
    loadSnakeColor();
    
    // 初始化音频
    initAudio();
    
    // 创建游戏板
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${x}-${y}`;
            gameBoard.appendChild(cell);
        }
    }
    
    // 渲染初始状态
    render();
    
    // 监听键盘事件
    document.addEventListener('keydown', handleKeyPress);
    
    // 监听触摸控制按钮事件
    document.getElementById('up-btn').addEventListener('click', () => {
        if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
    });
    document.getElementById('down-btn').addEventListener('click', () => {
        if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
    });
    document.getElementById('left-btn').addEventListener('click', () => {
        if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
    });
    document.getElementById('right-btn').addEventListener('click', () => {
        if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
    });
    document.getElementById('start-btn').addEventListener('click', toggleGame);
    
    // 监听难度选择
    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
        if (gameRunning) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speeds[difficulty]);
        }
    });
    
    // 监听音效开关
    soundToggle.addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
        if (soundEnabled && gameRunning) {
            backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
        } else {
            backgroundMusic.pause();
        }
    });
    
    // 监听蛇颜色选择
    snakeColorPicker.addEventListener('change', (e) => {
        updateSnakeColors(e.target.value);
        saveSnakeColor();
    });
}

// 渲染游戏状态
function render() {
    // 清空游戏板
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('snake', 'food');
        cell.style.backgroundColor = '';
    });
    
    // 渲染蛇
    snake.forEach((segment, index) => {
        const cell = document.getElementById(`cell-${segment.x}-${segment.y}`);
        if (cell) {
            cell.classList.add('snake');
            // 为蛇添加渐变颜色
            const colorIndex = index % snakeColors.length;
            cell.style.backgroundColor = snakeColors[colorIndex];
        }
    });
    
    // 渲染食物
    const foodCell = document.getElementById(`cell-${food.x}-${food.y}`);
    if (foodCell) {
        foodCell.classList.add('food');
        // 为食物添加随机颜色
        const colorIndex = Math.floor(Math.random() * foodColors.length);
        foodCell.style.backgroundColor = foodColors[colorIndex];
    }
    
    // 更新分数
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
}

// 处理键盘输入
function handleKeyPress(e) {
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
        case ' ': // 空格键开始/暂停
            toggleGame();
            break;
    }
}

// 播放音效
function playSound(type) {
    if (!soundEnabled) return;
    
    // 这里可以添加不同类型的音效
    // 由于没有实际的音频文件，我们使用简单的提示音
    if (type === 'eat') {
        // 模拟吃食物的音效
        console.log('Eating sound');
    } else if (type === 'gameOver') {
        // 模拟游戏结束的音效
        console.log('Game over sound');
    }
}

// 切换游戏状态
function toggleGame() {
    if (gameRunning) {
        clearInterval(gameInterval);
        gameRunning = false;
        // 暂停音乐
        if (soundEnabled) {
            backgroundMusic.pause();
        }
    } else {
        gameRunning = true;
        gameInterval = setInterval(gameLoop, speeds[difficulty]);
        // 播放音乐
        if (soundEnabled) {
            backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
        }
    }
}

// 游戏主循环
function gameLoop() {
    // 更新方向
    direction = { ...nextDirection };
    
    // 移动蛇头
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 添加新头
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score++;
        playSound('eat');
        generateFood();
    } else {
        // 移除尾部
        snake.pop();
    }
    
    // 渲染
    render();
}

// 检查碰撞
function checkCollision(head) {
    // 检查边界
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // 检查自身
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 保存最高分
function saveHighScore() {
    localStorage.setItem('snakeGameHighScore', highScore.toString());
}

// 加载最高分
function loadHighScore() {
    const savedScore = localStorage.getItem('snakeGameHighScore');
    if (savedScore) {
        highScore = parseInt(savedScore);
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        saveHighScore();
        alert(`恭喜！新的最高分：${highScore}`);
    } else {
        alert(`游戏结束！最终分数：${score}`);
    }
    
    playSound('gameOver');
    // 重置游戏
    resetGame();
}

// 重置游戏
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = { x: 15, y: 10 };
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    render();
}

// 初始化游戏
initGame();