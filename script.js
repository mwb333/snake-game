// 游戏常量
const GRID_SIZE = 20;
const CELL_SIZE = 20;

// 游戏变量
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 10 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let gameInterval;
let gameRunning = false;

// DOM元素
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');

// 初始化游戏
function initGame() {
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
}

// 渲染游戏状态
function render() {
    // 清空游戏板
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('snake', 'food');
    });
    
    // 渲染蛇
    snake.forEach(segment => {
        const cell = document.getElementById(`cell-${segment.x}-${segment.y}`);
        if (cell) cell.classList.add('snake');
    });
    
    // 渲染食物
    const foodCell = document.getElementById(`cell-${food.x}-${food.y}`);
    if (foodCell) foodCell.classList.add('food');
    
    // 更新分数
    scoreElement.textContent = score;
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

// 切换游戏状态
function toggleGame() {
    if (gameRunning) {
        clearInterval(gameInterval);
        gameRunning = false;
    } else {
        gameRunning = true;
        gameInterval = setInterval(gameLoop, 100);
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

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    alert(`游戏结束！最终分数：${score}`);
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