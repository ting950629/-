const CONFIG = {
    GROUND_Y: null,         // 地面高度（會在 setup 中設定）
    BACKGROUND_PATH: 'Backgrounds.png',  // 背景圖片路徑
    MOVEMENT_SPEED: 7,      // 移動速度
    JUMP_FORCE: -15,        // 跳躍力道
    GRAVITY: 0.8,          // 重力
    BULLET_SCALE: 1.5      // 子彈大小倍率
};

let characters = {
    player1: {
        animations: {
            run: {
                img: null,
                width: 27.3,
                height: 48,
                frames: 3,
                currentFrame: 0,
                frameDelay: 8,
                frameCount: 0,
                path: 'p1/walk.png'
            },
            attack: {
                img: null,
                width: 27.3,
                height: 44,
                frames: 3,
                currentFrame: 0,
                frameDelay: 6,
                frameCount: 0,
                path: 'p1/attack.png'
            },
            jump: {
                img: null,
                width: 27.3,
                height: 48,
                frames: 3,
                currentFrame: 0,
                frameDelay: 8,
                frameCount: 0,
                path: 'p1/idle.png'
            }
        },
        x: 100,
        y: 300,
        speed: CONFIG.MOVEMENT_SPEED,
        currentState: 'run',
        direction: 1,
        isAttacking: false,
        isJumping: false,
        jumpForce: CONFIG.JUMP_FORCE,
        gravity: CONFIG.GRAVITY,
        velocityY: 0,
        groundY: 300,
        health: 100,
        bullets: []
    },
    player2: {
        animations: {
            run: {
                img: null,
                width: 25.3,
                height: 48,
                frames: 3,
                currentFrame: 0,
                frameDelay: 8,
                frameCount: 0,
                path: 'p2/walk.png'
            },
            attack: {
                img: null,
                width: 35.3,
                height: 47,
                frames: 3,
                currentFrame: 0,
                frameDelay: 6,
                frameCount: 0,
                path: 'p2/attack.png'
            },
            jump: {
                img: null,
                width: 27.3,
                height: 48,
                frames: 3,
                currentFrame: 0,
                frameDelay: 8,
                frameCount: 0,
                path: 'p2/stand.png'
            }
        },
        x: 200,
        y: 300,
        speed: CONFIG.MOVEMENT_SPEED,
        currentState: 'run',
        direction: 1,
        isAttacking: false,
        isJumping: false,
        jumpForce: CONFIG.JUMP_FORCE,
        gravity: CONFIG.GRAVITY,
        velocityY: 0,
        groundY: 300,
        health: 100,
        bullets: []
    }
};

let backgroundImg;

// 添加遊戲狀態
let gameState = {
    isOver: false,
    winner: null
};

function preload() {
    loadImage(CONFIG.BACKGROUND_PATH, 
        img => {
            backgroundImg = img;
            console.log('背景圖片載入成功');
        },
        err => {
            console.error('背景圖片載入失敗:', err);
            backgroundImg = null;
        }
    );
    
    for (let charKey in characters) {
        let char = characters[charKey];
        for (let animKey in char.animations) {
            let anim = char.animations[animKey];
            anim.img = loadImage(anim.path);
        }
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);
    
    CONFIG.GROUND_Y = height - 100;
    
    characters.player1.groundY = CONFIG.GROUND_Y;
    characters.player2.groundY = CONFIG.GROUND_Y;
    characters.player1.y = CONFIG.GROUND_Y;
    characters.player2.y = CONFIG.GROUND_Y;
    characters.player2.x = width - 100;
}

class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 10;
        this.width = 10 * CONFIG.BULLET_SCALE;
        this.height = 5 * CONFIG.BULLET_SCALE;
    }

    update() {
        this.x += this.speed * this.direction;
    }

    draw() {
        fill(255, 255, 0);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    }

    hits(char) {
        return this.x > char.x - char.animations[char.currentState].width/2 &&
               this.x < char.x + char.animations[char.currentState].width/2 &&
               this.y > char.y - char.animations[char.currentState].height/2 &&
               this.y < char.y + char.animations[char.currentState].height/2;
    }
}

function draw() {
    background(220);
    if (backgroundImg) {
        image(backgroundImg, width/2, height/2, width, height);
    }
    
    // 只在遊戲未結束時更新角色和子彈
    if (!gameState.isOver) {
        updateAndDrawCharacter(characters.player1);
        updateAndDrawCharacter(characters.player2);
        updateBullets();
    } else {
        // 遊戲結束時仍然繪製角色，但不更新
        drawCharacter(characters.player1);
        drawCharacter(characters.player2);
    }
    
    drawHealthBars();
    drawTKUET();
    
    // 檢查遊戲是否結束
    checkGameOver();
    
    // 如果遊戲已結束，繪製結束畫面
    if (gameState.isOver) {
        drawGameOver();
    }
    
    fill(255);
    noStroke();
    textSize(14);
    text('使用 A/D 移動角色1, ←/→ 移動角色2', 10, 60);
    text('角色1: W跳躍, SPACE攻擊', 10, 80);
    text('角色2: ↑跳躍, ENTER攻擊', 10, 100);
}

function drawHealthBars() {
    fill(0);
    rect(50, 20, 200, 20);
    fill(255, 0, 0);
    rect(50, 20, characters.player1.health * 2, 20);
    
    fill(0);
    rect(width - 250, 20, 200, 20);
    fill(255, 0, 0);
    rect(width - 250, 20, characters.player2.health * 2, 20);
}

function updateBullets() {
    for (let i = characters.player1.bullets.length - 1; i >= 0; i--) {
        let bullet = characters.player1.bullets[i];
        bullet.update();
        bullet.draw();
        
        if (bullet.hits(characters.player2)) {
            characters.player2.health -= 10;
            characters.player1.bullets.splice(i, 1);
        }
        
        if (bullet.x < 0 || bullet.x > width) {
            characters.player1.bullets.splice(i, 1);
        }
    }
    
    for (let i = characters.player2.bullets.length - 1; i >= 0; i--) {
        let bullet = characters.player2.bullets[i];
        bullet.update();
        bullet.draw();
        
        if (bullet.hits(characters.player1)) {
            characters.player1.health -= 10;
            characters.player2.bullets.splice(i, 1);
        }
        
        if (bullet.x < 0 || bullet.x > width) {
            characters.player2.bullets.splice(i, 1);
        }
    }
}

function updateAndDrawCharacter(char) {
    if (char.y < char.groundY || char.velocityY < 0) {
        char.velocityY += char.gravity;
        char.y += char.velocityY;
    }
    
    if (char.y > char.groundY) {
        char.y = char.groundY;
        char.velocityY = 0;
        char.isJumping = false;
    }
    
    if (char === characters.player1) {
        if (keyIsDown(65)) {
            char.x -= char.speed;
            char.direction = -1;
        }
        if (keyIsDown(68)) {
            char.x += char.speed;
            char.direction = 1;
        }
        if (keyIsDown(87) && !char.isJumping) {
            char.velocityY = char.jumpForce;
            char.isJumping = true;
        }
        if (keyIsDown(32)) {
            if (!char.isAttacking) {
                char.bullets.push(new Bullet(char.x + 20 * char.direction, char.y, char.direction));
            }
            char.isAttacking = true;
        }
    } else {
        if (keyIsDown(LEFT_ARROW)) {
            char.x -= char.speed;
            char.direction = -1;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            char.x += char.speed;
            char.direction = 1;
        }
        if (keyIsDown(UP_ARROW) && !char.isJumping) {
            char.velocityY = char.jumpForce;
            char.isJumping = true;
        }
        if (keyIsDown(ENTER)) {
            if (!char.isAttacking) {
                char.bullets.push(new Bullet(char.x + 20 * char.direction, char.y, char.direction));
            }
            char.isAttacking = true;
        }
    }
    
    if (char.isAttacking) {
        char.currentState = 'attack';
    } else if (char.isJumping) {
        char.currentState = 'jump';
    } else {
        char.currentState = 'run';
    }
    
    let anim = char.animations[char.currentState];
    
    let sx = anim.currentFrame * anim.width;
    
    push();
    translate(char.x, char.y);
    scale(char.direction, 1);
    
    image(
        anim.img,
        0,
        0,
        anim.width,
        anim.height,
        sx,
        0,
        anim.width,
        anim.height
    );
    
    pop();

    anim.frameCount++;
    if (anim.frameCount >= anim.frameDelay) {
        anim.frameCount = 0;
        anim.currentFrame = (anim.currentFrame + 1) % anim.frames;
        
        if (char.isAttacking && char.currentState === 'attack' && anim.currentFrame === 0) {
            char.isAttacking = false;
        }
    }
}

function checkGameOver() {
    if (!gameState.isOver) {
        if (characters.player1.health <= 0) {
            gameState.isOver = true;
            gameState.winner = "Player 2";
            drawGameOver();
        }
        if (characters.player2.health <= 0) {
            gameState.isOver = true;
            gameState.winner = "Player 1";
            drawGameOver();
        }
    }
}

function drawTKUET() {
    textAlign(CENTER, TOP);
    textSize(36);
    
    fill(0);
    text("TKUET", width/2 + 2, 22);
    
    fill(255, 215, 0);
    stroke(0);
    strokeWeight(2);
    text("TKUET", width/2, 20);
    
    noStroke();
    textAlign(LEFT, BASELINE);
}

// 添加遊戲結束畫面
function drawGameOver() {
    // 半透明黑色背景
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    // 結束面板
    let panelWidth = 400;
    let panelHeight = 300;
    let x = width/2 - panelWidth/2;
    let y = height/2 - panelHeight/2;
    
    // 面板背景
    fill(30, 30, 30, 240);
    stroke(255);
    strokeWeight(2);
    rect(x, y, panelWidth, panelHeight, 20);
    
    // 遊戲結束文字
    noStroke();
    textAlign(CENTER, CENTER);
    
    // GAME OVER 標題
    fill(255, 215, 0);  // 金色
    textSize(50);
    text("GAME OVER", width/2, y + 70);
    
    // 勝利者
    fill(255);
    textSize(30);
    text(gameState.winner + " Wins!", width/2, y + 130);
    
    // 重新開始提示
    fill(200);
    textSize(20);
    text("按 R 重新開始", width/2, y + 200);
    text("按 ESC 結束遊戲", width/2, y + 230);
    
    // 重置文字對齊
    textAlign(LEFT, BASELINE);
}

// 添加重新開始功能
function keyPressed() {
    if (gameState.isOver) {
        if (key === 'r' || key === 'R') {
            resetGame();
        }
        if (keyCode === ESCAPE) {
            window.close();
        }
    }
}

// 添加重置遊戲函數
function resetGame() {
    // 重置角色狀態
    characters.player1.health = 100;
    characters.player2.health = 100;
    characters.player1.x = 100;
    characters.player2.x = width - 100;
    characters.player1.y = characters.player1.groundY;
    characters.player2.y = characters.player2.groundY;
    characters.player1.bullets = [];
    characters.player2.bullets = [];
    
    // 重置遊戲狀態
    gameState.isOver = false;
    gameState.winner = null;
    
    // 重新開始遊戲循環
    loop();
}

// 添加繪製角色函數（不更新狀態）
function drawCharacter(char) {
    let anim = char.animations[char.currentState];
    let sx = anim.currentFrame * anim.width;
    
    push();
    translate(char.x, char.y);
    scale(char.direction, 1);
    
    image(
        anim.img,
        0,
        0,
        anim.width,
        anim.height,
        sx,
        0,
        anim.width,
        anim.height
    );
    
    pop();
}
