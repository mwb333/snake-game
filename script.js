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

// 速度设置
const speeds = {
    easy: 150,
    medium: 100,
    hard: 60
};

// 颜色设置
let snakeColors = ['#00ffff', '#00cccc', '#009999', '#006666'];
const foodColors = ['#ff9900', '#ffaa33', '#ffcc66', '#ffdd99'];

// 变身等级设置
const evolutionLevels = [
    { name: '幼蛇', colors: ['#00ffff', '#00cccc', '#009999', '#006666'], glow: '0 0 5px rgba(0, 255, 255, 0.5)' },
    { name: '灵蛇', colors: ['#ff00ff', '#cc00cc', '#990099', '#660066'], glow: '0 0 8px rgba(255, 0, 255, 0.7)' },
    { name: '蛟龙', colors: ['#ffd700', '#ccac00', '#998100', '#665600'], glow: '0 0 10px rgba(255, 215, 0, 0.8)' },
    { name: '神龙', colors: ['#ff4500', '#cc3700', '#992900', '#661c00'], glow: '0 0 12px rgba(255, 69, 0, 0.9)' },
    { name: '宇宙蛇神', colors: ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0'], glow: '0 0 15px rgba(255, 255, 255, 1)' }
];

let currentEvolution = 0;



// DOM元素
let gameBoard, scoreElement, highScoreElement, difficultySelect, snakeColorPicker;

// 初始化DOM元素
function initDOM() {
    try {
        gameBoard = document.getElementById('game-board');
        scoreElement = document.getElementById('score');
        highScoreElement = document.getElementById('high-score');
        difficultySelect = document.getElementById('difficulty-select');
        snakeColorPicker = document.getElementById('snake-color-picker');
        
        // 检查所有DOM元素是否存在
        if (!gameBoard || !scoreElement || !highScoreElement || !difficultySelect || !snakeColorPicker) {
            console.log('Error: Missing DOM elements');
        }
    } catch (e) {
        console.log('Error initializing DOM elements:', e);
    }
}

// 保存蛇颜色
function saveSnakeColor() {
    try {
        if (snakeColorPicker) {
            localStorage.setItem('snakeGameColor', snakeColorPicker.value);
        }
    } catch (e) {
        console.log('Error saving snake color:', e);
    }
}

// 加载蛇颜色
function loadSnakeColor() {
    try {
        const savedColor = localStorage.getItem('snakeGameColor');
        if (savedColor && snakeColorPicker) {
            snakeColorPicker.value = savedColor;
            updateSnakeColors(savedColor);
        }
    } catch (e) {
        console.log('Error loading snake color:', e);
    }
}

// 更新蛇颜色
function updateSnakeColors(baseColor) {
    try {
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
    } catch (e) {
        console.log('Error updating snake colors:', e);
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
    try {
        // 初始化DOM元素
        initDOM();
        
        // 加载最高分
        loadHighScore();
        
        // 加载蛇颜色
        loadSnakeColor();
        
        // 创建游戏板
        if (gameBoard) {
            try {
                for (let y = 0; y < GRID_SIZE; y++) {
                    for (let x = 0; x < GRID_SIZE; x++) {
                        const cell = document.createElement('div');
                        cell.classList.add('cell');
                        cell.id = `cell-${x}-${y}`;
                        gameBoard.appendChild(cell);
                    }
                }
            } catch (e) {
                console.log('Error creating game board:', e);
            }
        }
        
        // 渲染初始状态
        render();
        
        // 监听键盘事件
        document.addEventListener('keydown', handleKeyPress);
        
        // 监听触摸控制按钮事件
        try {
            const upBtn = document.getElementById('up-btn');
            const downBtn = document.getElementById('down-btn');
            const leftBtn = document.getElementById('left-btn');
            const rightBtn = document.getElementById('right-btn');
            const startBtn = document.getElementById('start-btn');
            
            if (upBtn) upBtn.addEventListener('click', () => { if (direction.y !== 1) nextDirection = { x: 0, y: -1 }; });
            if (downBtn) downBtn.addEventListener('click', () => { if (direction.y !== -1) nextDirection = { x: 0, y: 1 }; });
            if (leftBtn) leftBtn.addEventListener('click', () => { if (direction.x !== 1) nextDirection = { x: -1, y: 0 }; });
            if (rightBtn) rightBtn.addEventListener('click', () => { if (direction.x !== -1) nextDirection = { x: 1, y: 0 }; });
            if (startBtn) startBtn.addEventListener('click', toggleGame);
        } catch (e) {
            console.log('Error adding touch control listeners:', e);
        }
        
        // 监听难度选择
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                difficulty = e.target.value;
                if (gameRunning) {
                    clearInterval(gameInterval);
                    gameInterval = setInterval(gameLoop, speeds[difficulty]);
                }
            });
        }
        

        
        // 监听蛇颜色选择
        if (snakeColorPicker) {
            snakeColorPicker.addEventListener('change', (e) => {
                updateSnakeColors(e.target.value);
                saveSnakeColor();
            });
        }
    } catch (e) {
        console.log('Error initializing game:', e);
    }
}

// 检查变身等级
function checkEvolution() {
    try {
        const newLevel = Math.min(Math.floor(score / 10), evolutionLevels.length - 1);
        if (newLevel > currentEvolution) {
            currentEvolution = newLevel;
            // 应用新的外观
            const evolution = evolutionLevels[currentEvolution];
            snakeColors = evolution.colors;
            
            // 显示升级特效
            showEvolutionEffect(evolution.name);
            
            // 更新等级显示
            const evolutionLevelElement = document.getElementById('evolution-level');
            if (evolutionLevelElement) {
                evolutionLevelElement.textContent = evolution.name;
            }
        }
        
        // 更新进度条
        const progress = (score % 10) / 10 * 100;
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = `${score % 10}/10`;
    } catch (e) {
        console.log('Error checking evolution:', e);
    }
}

// 显示变身特效
function showEvolutionEffect(levelName) {
    try {
        const effectsContainer = document.getElementById('game-effects');
        if (effectsContainer) {
            const effect = document.createElement('div');
            effect.className = 'evolution-effect';
            effect.innerHTML = `
                <div class="level-up-text">✨ ${levelName} ✨</div>
            `;
            effect.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: #ffd700;
                padding: 20px;
                border-radius: 10px;
                border: 2px solid #ffd700;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                z-index: 100;
                animation: levelUp 2s ease-out forwards;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
            `;
            
            effectsContainer.appendChild(effect);
            
            // 2秒后移除特效
            setTimeout(() => {
                if (effectsContainer.contains(effect)) {
                    effectsContainer.removeChild(effect);
                }
            }, 2000);
        }
    } catch (e) {
        console.log('Error showing evolution effect:', e);
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes levelUp {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(style);

// 渲染游戏状态
function render() {
    try {
        // 清空游戏板
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('snake', 'food');
            cell.style.backgroundColor = '';
            cell.style.boxShadow = '';
        });
        
        // 获取当前等级的发光效果
        const currentGlow = evolutionLevels[currentEvolution].glow;
        
        // 渲染蛇
        snake.forEach((segment, index) => {
            const cell = document.getElementById(`cell-${segment.x}-${segment.y}`);
            if (cell) {
                cell.classList.add('snake');
                // 为蛇添加渐变颜色
                const colorIndex = index % snakeColors.length;
                cell.style.backgroundColor = snakeColors[colorIndex];
                // 添加发光效果
                cell.style.boxShadow = currentGlow;
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
        if (scoreElement) scoreElement.textContent = score;
        if (highScoreElement) highScoreElement.textContent = highScore;
        
        // 检查变身等级
        checkEvolution();
    } catch (e) {
        console.log('Error rendering game:', e);
    }
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
    } else {
        gameRunning = true;
        gameInterval = setInterval(gameLoop, speeds[difficulty]);
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
    try {
        snake = [{ x: 10, y: 10 }];
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        score = 0;
        currentEvolution = 0;
        snakeColors = evolutionLevels[0].colors;
        
        // 生成随机食物位置
        generateFood();
        
        // 重置等级显示
        const evolutionLevelElement = document.getElementById('evolution-level');
        if (evolutionLevelElement) {
            evolutionLevelElement.textContent = evolutionLevels[0].name;
        }
        
        // 重置进度条
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = '0/10';
        
        render();
    } catch (e) {
        console.log('Error resetting game:', e);
    }
}

// 初始化游戏
initGame();