"use strict";
var _btn;
(function (_btn) {
    var Button = (function () {
        function Button(x, y, width, height, color, isMouseDown) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.isMouseDown = isMouseDown;
        }
        return Button;
    }());
    _btn.Button = Button;
})(_btn || (_btn = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _btn;
(function (_btn) {
    var BoolButton = (function (_super) {
        __extends(BoolButton, _super);
        function BoolButton(x, y, width, height, color, text, isMouseDown) {
            var _this = _super.call(this, x, y, width, height, color, isMouseDown) || this;
            _this.text = text;
            _this.isMouseDown = isMouseDown;
            return _this;
        }
        BoolButton.prototype.handleMousePressed = function () {
            var box = this.getHitbox();
            if (!mouseIsPressed && this.isMouseDown && (mouseX > box.x &&
                mouseX < box.rhs &&
                mouseY > box.y &&
                mouseY < box.bhs)) {
                return true;
            }
            this.isMouseDown = mouseIsPressed;
            return false;
        };
        BoolButton.prototype.draw = function () {
            var box = this.getHitbox();
            push();
            fill(this.color);
            rect(box.x, box.y, box.width, box.height, 20);
            fill('white');
            textAlign(CENTER);
            textSize(30);
            text(this.text, this.x, this.y + 10);
            pop();
        };
        BoolButton.prototype.getHitbox = function () {
            return {
                x: this.x - this.width / 2,
                y: this.y - this.height / 2,
                rhs: (this.x - this.width / 2) + this.width,
                bhs: (this.y - this.height / 2) + this.height,
                width: this.width,
                height: this.height
            };
        };
        return BoolButton;
    }(_btn.Button));
    _btn.BoolButton = BoolButton;
})(_btn || (_btn = {}));
var CollidableObjectManager = (function () {
    function CollidableObjectManager(target) {
        this.collidableObjectList = [];
        this.target = target;
    }
    CollidableObjectManager.prototype.updatePos = function () {
        for (var _i = 0, _a = this.collidableObjectList; _i < _a.length; _i++) {
            var collidableObject = _a[_i];
            collidableObject.updatePos();
            if (collidableObject instanceof PlayerProjectile) {
                collidableObject.checkCollision(this.collidableObjectList);
            }
        }
        this.removeCollidedObjects();
    };
    CollidableObjectManager.prototype.removeCollidedObjects = function () {
        for (var i = 0; i < this.collidableObjectList.length; i++) {
            var object = this.collidableObjectList[i];
            if (object.shouldBeRemoved) {
                this.removeCollidableObjectFromList(i);
            }
            if (object.x > windowWidth || object.x < 0 || object.y > windowHeight) {
                if (object instanceof PlayerProjectile) {
                    var player = object.getOwnerPlayer();
                    player.setProjectileExists(false);
                }
                object.shouldBeRemoved = true;
            }
        }
    };
    CollidableObjectManager.prototype.draw = function () {
        for (var _i = 0, _a = this.collidableObjectList; _i < _a.length; _i++) {
            var collidableObject = _a[_i];
            collidableObject.draw();
        }
    };
    CollidableObjectManager.prototype.addCollidableObjectToList = function (collidableObject) {
        this.collidableObjectList.push(collidableObject);
    };
    CollidableObjectManager.prototype.removeCollidableObjectFromList = function (index) {
        this.collidableObjectList.splice(index, 1);
    };
    CollidableObjectManager.prototype.getCollidableObjectList = function () {
        return this.collidableObjectList;
    };
    return CollidableObjectManager;
}());
var GameController = (function () {
    function GameController() {
        this.target = new TargetGameCanvas(windowWidth / 2, windowHeight / 2);
        this.collidableObjectManager = new CollidableObjectManager(this.target);
        this.playerFactory = new PlayerFactory(this.collidableObjectManager);
        this.startMenu = new StartMenu(width / 2, height * 1 / 7, this.playerFactory);
        this.isGameStarted = false;
        this.isGameOver = false;
        this.timerCreated = false;
        this.timer = new Timer(1, 1, 1);
        this.builtPlayers = false;
        this.buildGamePlayers = [];
        this.powerUpExists = false;
        this.scoreboard = new Scoreboard(this.target);
    }
    GameController.prototype.updateGame = function () {
        if (!this.isGameStarted) {
            this.mainMenu();
        }
        else if (this.isGameStarted && !this.isGameOver) {
            this.gameRunning();
        }
        else if (this.isGameOver) {
            if (this.scoreboard.getRestartGame) {
                this.restartGame();
            }
            else {
                this.scoreboard.draw();
            }
        }
    };
    GameController.prototype.mainMenu = function () {
        this.startMenu.draw();
        this.startMenu.update();
        this.isGameStarted = this.startMenu.getStartGame();
    };
    GameController.prototype.gameRunning = function () {
        this.setTimerOnStart();
        this.setPlayersOnStart();
        this.generatePowerUps();
        this.target.draw();
        this.target.updatePos();
        this.timer.draw();
        this.getAllPlayerInputAndDraw();
        this.collidableObjectManager.updatePos();
        this.collidableObjectManager.draw();
        this.checkIfGameOver();
    };
    GameController.prototype.restartGame = function () {
        this.isGameOver = false;
        this.isGameStarted = false;
        this.target = new TargetGameCanvas(windowWidth / 2, windowHeight / 2);
        this.timer = new Timer(50, width / 2, height * 1 / 6);
        this.builtPlayers = false;
        this.timerCreated = false;
        this.buildGamePlayers = [];
        this.collidableObjectManager = new CollidableObjectManager(this.target);
        this.playerFactory = new PlayerFactory(this.collidableObjectManager);
        this.startMenu = new StartMenu(width / 2, height * 1 / 7, this.playerFactory);
        this.scoreboard = new Scoreboard(this.target);
    };
    GameController.prototype.generatePowerUps = function () {
        this.powerUpExists = false;
        for (var _i = 0, _a = this.collidableObjectManager.getCollidableObjectList(); _i < _a.length; _i++) {
            var collidableObject = _a[_i];
            if (collidableObject instanceof PowerUp) {
                this.powerUpExists = true;
            }
        }
        if (!this.powerUpExists) {
            var randomDigit = round(random(1, 300));
            if (randomDigit === 150) {
                var powerUp = new PowerUp(random(0, windowWidth), -50, 10, 10, 25, '#1aff1a', this.collidableObjectManager, this.powerUpTypeRandom());
                this.collidableObjectManager.addCollidableObjectToList(powerUp);
            }
        }
    };
    GameController.prototype.powerUpTypeRandom = function () {
        var randomNumber = Math.round(random(0, 1));
        var powerUpString;
        if (randomNumber == 0) {
            powerUpString = 'SpeedCanon';
        }
        else {
            powerUpString = 'SuperBlast';
        }
        return powerUpString;
    };
    GameController.prototype.setTimerOnStart = function () {
        if (!this.timerCreated) {
            this.timer = new Timer(this.startMenu.getSelectedTime(), width / 2, height * 1 / 6);
            this.timerCreated = true;
        }
    };
    GameController.prototype.setPlayersOnStart = function () {
        if (!this.builtPlayers) {
            var posIndex = windowWidth / (this.startMenu.getPlayers() + 2);
            var startIndex = posIndex / 2;
            var posArray = [];
            for (var i = 0; i < this.startMenu.getPlayers(); i++) {
                startIndex += posIndex;
                posArray.push({ x: startIndex, y: windowHeight });
            }
            this.buildGamePlayers = this.playerFactory.buildGamePlayer(this.startMenu.getPlayers(), posArray);
            this.builtPlayers = true;
        }
    };
    GameController.prototype.getAllPlayerInputAndDraw = function () {
        this.buildGamePlayers.forEach(function (player) {
            player.draw();
            player.handleControls();
            if (keyIsDown(player.aimLeft[1]) || keyIsDown(player.aimRight[1]) || keyIsDown(player.fireButton[1])) {
                player.update();
            }
        });
    };
    GameController.prototype.checkIfGameOver = function () {
        if (this.timer.getTimeLeft === 0) {
            this.isGameOver = true;
        }
    };
    return GameController;
}());
var _ply;
(function (_ply) {
    var Player = (function () {
        function Player(name, color, aimLeft, fireButton, aimRight) {
            this.name = name;
            this.color = color;
            this.aimLeft = aimLeft;
            this.fireButton = fireButton;
            this.aimRight = aimRight;
        }
        return Player;
    }());
    _ply.Player = Player;
})(_ply || (_ply = {}));
var _ply;
(function (_ply) {
    var GamePlayer = (function (_super) {
        __extends(GamePlayer, _super);
        function GamePlayer(name, color, aimLeft, fireButton, aimRight, cOM, position) {
            var _this = _super.call(this, name, color, aimLeft, fireButton, aimRight) || this;
            _this.angle = 180;
            _this.barrelPos = 0;
            _this.projectileExists = false;
            _this.shouldFire = false;
            _this.barrelPoint = { x: 0, y: 0 };
            _this.cooldownValue = -180;
            _this.hasSuperBlastPowerUp = false;
            _this.blastRadius = 150;
            _this.speedCannonPowerUp = 0;
            _this.coolDownTime = 60;
            _this.cOM = cOM;
            _this.xPos = position.x;
            _this.yPos = position.y;
            return _this;
        }
        GamePlayer.prototype.setProjectileExists = function (status) {
            this.projectileExists = status;
        };
        GamePlayer.prototype.draw = function () {
            push();
            angleMode(DEGREES);
            noStroke();
            translate(this.xPos, this.yPos);
            rotate(this.angle);
            fill("rgb(" + this.color + ")");
            rect((-20), this.barrelPos + 10, 40, 85);
            pop();
            push();
            stroke("rgb(" + this.color + ")");
            strokeWeight(5);
            fill('#1B1E1A');
            arc(this.xPos, this.yPos, 120, 120, PI, 0);
            pop();
            push();
            angleMode(DEGREES);
            noStroke();
            translate(this.xPos, this.yPos);
            rotate(this.angle);
            fill('#1B1E1A');
            rect((-15), (this.barrelPos) + 10, 30, 75);
            fill("rgb(" + this.color + ")");
            rect((-25), (this.barrelPos + 85), 50, 15);
            pop();
            push();
            angleMode(RADIANS);
            noStroke();
            fill(this.powerUpPlayerColor());
            arc(this.xPos, this.yPos, 80, 80, 0, PI * 2);
            strokeWeight(6);
            stroke('#30362f');
            noFill();
            arc(this.xPos, this.yPos, 80, 80, 0, PI * 2);
            strokeWeight(3);
            stroke("rgb(" + this.color + ")");
            arc(this.xPos, (this.yPos), 80, 80, radians(-180), radians(this.cooldownValue));
            pop();
        };
        GamePlayer.prototype.update = function () {
            this.barrelPoint.x = this.xPos + ((this.angle - 180) * 1.6);
            this.barrelPoint.y = (this.yPos - 100) + Math.pow((this.angle - 180) * .3, 2) * .15;
        };
        GamePlayer.prototype.handleControls = function () {
            if (keyIsDown(this.aimLeft[1])) {
                if (this.angle >= 130) {
                    this.angle -= 2;
                }
            }
            if (keyIsDown(this.aimRight[1])) {
                if (this.angle <= 230) {
                    this.angle += 2;
                }
            }
            if (keyIsDown(this.fireButton[1])) {
                if (this.projectileExists === true && !this.shouldFire) {
                    this.explodeProjectile();
                }
                else if (this.projectileExists === false) {
                    this.loadBarrel();
                    this.shouldFire = true;
                }
            }
            if ((!keyIsDown(this.fireButton[1]) && this.shouldFire)) {
                this.shootProjectile();
                this.barrelPos = 0;
                this.projectileExists = true;
                this.shouldFire = false;
            }
        };
        GamePlayer.prototype.explodeProjectile = function () {
            var _this = this;
            var projectileArray = this.cOM.getCollidableObjectList();
            var _loop_1 = function (i) {
                var projectile = projectileArray[i];
                if (projectile.color === this_1.color && projectile.getHasExploded() === false) {
                    projectile.setHasExploded(true);
                    var splash = { posX: projectile.x, posY: projectile.y, color: projectile.color, splashDiameter: this_1.blastRadius };
                    if (this_1.hasSuperBlastPowerUp === true) {
                        splash.splashDiameter = splash.splashDiameter * 2;
                        this_1.cOM.target.addSplashToTargetCanvas(splash);
                        this_1.hasSuperBlastPowerUp = false;
                    }
                    else {
                        this_1.cOM.target.addSplashToTargetCanvas(splash);
                    }
                    this_1.coolDownTime = (this_1.speedCannonPowerUp > 0) ? 30 : 60;
                    var cooldown_1 = this_1.coolDownTime;
                    var cooldownTimer_1 = setInterval(function () {
                        cooldown_1--;
                        _this.cooldownValue += 180 / _this.coolDownTime;
                        if (cooldown_1 === 0) {
                            clearInterval(cooldownTimer_1);
                            _this.cooldownValue = -180;
                            _this.projectileExists = false;
                            projectile.shouldBeRemoved = true;
                        }
                    }, 10);
                }
            };
            var this_1 = this;
            for (var i = 0; i < projectileArray.length; i++) {
                _loop_1(i);
            }
        };
        GamePlayer.prototype.loadBarrel = function () {
            if (this.barrelPos > -20) {
                if (this.barrelPos > -10) {
                    this.barrelPos -= .3;
                }
                else if (this.barrelPos < -10) {
                    this.barrelPos -= .1;
                    if (this.barrelPos < -19) {
                        this.barrelPos = -18;
                    }
                }
            }
        };
        GamePlayer.prototype.shootProjectile = function () {
            var projectile = new PlayerProjectile((this.angle - 180) * (this.barrelPos * -.015), (this.barrelPos), this.color, this.barrelPoint.x, this.barrelPoint.y, 10, this);
            this.cOM.addCollidableObjectToList(projectile);
            this.speedCannonPowerUp = (this.speedCannonPowerUp <= 0) ? this.speedCannonPowerUp = 0 : this.speedCannonPowerUp -= 1;
        };
        GamePlayer.prototype.applyPowerUp = function (powerUp) {
            var type = powerUp.type;
            if (type === 'SuperBlast') {
                this.hasSuperBlastPowerUp = true;
            }
            else if (type === 'SpeedCanon') {
                this.speedCannonPowerUp = 3;
            }
        };
        GamePlayer.prototype.powerUpPlayerColor = function () {
            if (this.hasSuperBlastPowerUp) {
                return '#B933F4';
            }
            if (this.speedCannonPowerUp > 0) {
                if (this.speedCannonPowerUp === 3) {
                    return '#F4E533';
                }
                else if (this.speedCannonPowerUp === 2) {
                    return '#F49933';
                }
                else if (this.speedCannonPowerUp === 1) {
                    return '#F44A33';
                }
                else {
                    return '#1B1E1A';
                }
            }
            else {
                return '#1B1E1A';
            }
        };
        return GamePlayer;
    }(_ply.Player));
    _ply.GamePlayer = GamePlayer;
})(_ply || (_ply = {}));
var _ply;
(function (_ply) {
    var MenuPlayer = (function (_super) {
        __extends(MenuPlayer, _super);
        function MenuPlayer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MenuPlayer.prototype.draw = function (x, y) {
            push();
            rectMode(CENTER);
            textAlign(CENTER);
            fill("rgb(" + this.color + ")");
            rect(x, y - 20, 150, 40);
            fill('white');
            textSize(24);
            stroke('#1B1E1A');
            strokeWeight(1.5);
            text(this.name, x, y - 13);
            textSize(20);
            text("fire: " + this.fireButton[0], x, y + 20);
            text("aim: " + this.aimLeft[0] + " + " + this.aimRight[0], x, y + 40);
            pop();
        };
        return MenuPlayer;
    }(_ply.Player));
    _ply.MenuPlayer = MenuPlayer;
})(_ply || (_ply = {}));
var PlayerFactory = (function () {
    function PlayerFactory(cOM) {
        this.players = [
            {
                name: 'blue',
                color: '74, 124, 221',
                aimLeft: ['1', 49],
                fireButton: ['2', 50],
                aimRight: ['3', 51]
            },
            {
                name: 'purple',
                color: '202, 94, 211',
                aimLeft: [',', 188],
                fireButton: ['.', 190],
                aimRight: ['-', 189]
            },
            {
                name: 'green',
                color: '102, 233, 69',
                aimLeft: ['z', 90],
                fireButton: ['x', 88],
                aimRight: ['c', 67]
            },
            {
                name: 'yellow',
                color: '231, 255, 87',
                aimLeft: ['8', 56],
                fireButton: ['9', 57],
                aimRight: ['0', '48']
            }
        ];
        this.cOM = cOM;
    }
    PlayerFactory.prototype.buildMenuPlayer = function (noOfPlayers) {
        var playerArray = [];
        for (var i = 0; i < noOfPlayers; i++) {
            var player = this.players[i];
            playerArray.push(new _ply.MenuPlayer(player.name, player.color, player.aimLeft, player.fireButton, player.aimRight));
        }
        return playerArray;
    };
    PlayerFactory.prototype.buildGamePlayer = function (noOfPlayers, posArray) {
        var playerArray = [];
        for (var i = 0; i < noOfPlayers; i++) {
            var player = this.players[i];
            var position = posArray[i];
            playerArray.push(new _ply.GamePlayer(player.name, player.color, player.aimLeft, player.fireButton, player.aimRight, this.cOM, position));
        }
        return playerArray;
    };
    return PlayerFactory;
}());
var PlayerProjectile = (function () {
    function PlayerProjectile(velX, velY, color, x, y, blastRadius, player) {
        this.explosionValue = 200;
        this.projectileGravity = 0.2;
        this.hasExploded = false;
        this.shouldBeRemoved = false;
        this.velX = velX;
        this.velY = velY + (velX * velX) * .03;
        this.color = color;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.blastRadius = blastRadius;
        this.ownerPlayer = player;
    }
    PlayerProjectile.prototype.getOwnerPlayer = function () {
        return this.ownerPlayer;
    };
    PlayerProjectile.prototype.getHasExploded = function () {
        return this.hasExploded;
    };
    PlayerProjectile.prototype.setHasExploded = function (status) {
        this.hasExploded = status;
    };
    PlayerProjectile.prototype.checkCollision = function (otherObjectList) {
        for (var _i = 0, otherObjectList_1 = otherObjectList; _i < otherObjectList_1.length; _i++) {
            var otherObject = otherObjectList_1[_i];
            var pointDist = dist(this.x, this.y, otherObject.x, otherObject.y);
            if (this !== otherObject && pointDist < this.radius + otherObject.radius) {
                if (otherObject instanceof PlayerProjectile) {
                    var overlap = (this.radius + otherObject.radius) - pointDist;
                    if (this.y === otherObject.y || this.x === otherObject.x) {
                        if (this.y === otherObject.y) {
                            if (this.x > otherObject.x) {
                                this.x += overlap / 2;
                                otherObject.x -= overlap / 2;
                            }
                            else {
                                this.x -= overlap / 2;
                                otherObject.x += overlap / 2;
                            }
                        }
                        else {
                            if (this.y > otherObject.y) {
                                this.y += overlap / 2;
                                otherObject.y -= overlap / 2;
                            }
                        }
                    }
                    else {
                        if (this.y > otherObject.y) {
                            this.y += overlap / 4;
                            otherObject.y -= overlap / 4;
                        }
                        else {
                            this.y -= overlap / 4;
                            otherObject.y += overlap / 4;
                        }
                        if (this.x > otherObject.x) {
                            this.x += overlap / 4;
                            otherObject.x -= overlap / 4;
                        }
                        else {
                            this.x -= overlap / 4;
                            otherObject.x += overlap / 4;
                        }
                    }
                    var objectAVel = { x: this.velX, y: this.velY }, objectBVel = { x: otherObject.velX, y: otherObject.velY };
                    this.velX = objectBVel.x;
                    this.velY = objectBVel.y;
                    otherObject.velX = objectAVel.x;
                    otherObject.velY = objectAVel.y;
                }
                if (otherObject instanceof PowerUp) {
                    this.ownerPlayer.setProjectileExists(false);
                    this.ownerPlayer.applyPowerUp(otherObject);
                    this.shouldBeRemoved = true;
                    otherObject.shouldBeRemoved = true;
                }
            }
        }
    };
    PlayerProjectile.prototype.draw = function () {
        push();
        if (this.hasExploded) {
            noStroke();
            var colors = this.color.split(',');
            fill(parseInt(colors[0]), parseInt(colors[1]), parseInt(colors[2]), this.explosionValue);
            circle(this.x, this.y, this.radius * (this.explosionValue * .02) + 100);
        }
        else {
            stroke('#1B1E1A');
            fill("rgb(" + this.color + ")");
            circle(this.x, this.y, this.radius * 2);
        }
        pop();
    };
    PlayerProjectile.prototype.updatePos = function () {
        if (!this.hasExploded) {
            this.explosionValue = 200;
            this.y += this.velY;
            this.x += this.velX;
            this.velY += this.projectileGravity;
        }
        else {
            this.explosionValue -= 4;
        }
    };
    return PlayerProjectile;
}());
var PowerUp = (function () {
    function PowerUp(posX, posY, velX, velY, radius, color, cOM, type) {
        this.shouldBeRemoved = false;
        this.isSuperBlastPowerUp = false;
        this.isSpeedCannonPowerUp = false;
        this.x = posX;
        this.y = posY;
        this.velX = velX;
        this.velY = velY;
        this.radius = radius;
        this.color = color;
        this.cOM = cOM;
        this._type = type;
    }
    Object.defineProperty(PowerUp.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    PowerUp.prototype.draw = function () {
        push();
        stroke(100);
        noStroke();
        fill(this.color);
        circle(this.x, this.y, this.radius * 2);
        if (this._type == 'SuperBlast') {
            fill('#B933F4');
        }
        else {
            fill('yellow');
        }
        triangle(this.x - 10, this.y, this.x, this.y - 15, this.x + 10, this.y);
        rect(this.x - 5, this.y, 10, 15);
        pop();
        this.x = this.x += random(-1, 1);
        this.y = this.y + 1;
    };
    PowerUp.prototype.updatePos = function () {
        return 1;
    };
    return PowerUp;
}());
var _btn;
(function (_btn) {
    var RadioButton = (function (_super) {
        __extends(RadioButton, _super);
        function RadioButton(x, y, width, height, color, isMouseDown, values, definedValue) {
            var _this = _super.call(this, x, y, width, height, color, isMouseDown) || this;
            _this.valuePos = [];
            _this.mouseWasPressed = false;
            _this.values = values;
            _this.definedValue = definedValue;
            var posIndex = windowWidth / (_this.values.length + 4);
            var startIndex = posIndex * 1.5;
            for (var i = 0; i < _this.values.length; i++) {
                startIndex += posIndex;
                _this.valuePos.push(startIndex);
            }
            return _this;
        }
        RadioButton.prototype.draw = function () {
            push();
            fill(this.color);
            noStroke();
            rectMode(CENTER);
            rect(this.x, this.y, this.width, this.height);
            for (var i = 0; i < this.values.length; i++) {
                noStroke();
                if (this.values[i] === this.definedValue) {
                    var rectWidth = 50 + 15 * (this.definedValue.toString().length - 1);
                    fill('gray');
                    rect(this.valuePos[i], this.y, rectWidth, 50);
                }
                fill('white');
                textAlign(CENTER);
                textSize(40);
                text(this.values[i], this.valuePos[i], this.y + 14);
            }
            pop();
        };
        RadioButton.prototype.handleMousePressed = function () {
            if (!this.isMouseDown && mouseIsPressed) {
                this.mouseWasPressed = true;
            }
            if (this.mouseWasPressed && !mouseIsPressed) {
                this.mouseWasPressed = false;
                for (var i = 0; i < this.values.length; i++) {
                    if (mouseX >= (this.valuePos[i] - 25) &&
                        mouseX <= (this.valuePos[i] + 25) &&
                        mouseY >= (this.y - 25) &&
                        mouseY <= (this.y + 25)) {
                        this.definedValue = this.values[i];
                    }
                }
            }
            return this.definedValue;
        };
        return RadioButton;
    }(_btn.Button));
    _btn.RadioButton = RadioButton;
})(_btn || (_btn = {}));
var Scoreboard = (function () {
    function Scoreboard(target) {
        this.hasRun = false;
        this.delayOver = false;
        this.fadeCounter = 0;
        this.restartGame = false;
        this.targetCanvasCutoutImage = new p5.Image();
        this.totalPixelsInCanvas = 0;
        this.scoreBarCounter = 0;
        this.colorScoreList = [];
        this.target = target;
    }
    Scoreboard.prototype.draw = function () {
        var _this = this;
        if (!this.hasRun) {
            this.target.draw();
            this.targetCanvasCutoutImage = this.target.getCutoutImage;
            this.countPixelsInTarget(this.targetCanvasCutoutImage);
            this.hasRun = true;
            this.restartGame = false;
            setTimeout(function () { _this.delayOver = true; }, 3000);
        }
        if (!this.delayOver) {
            this.fadeOutOldCanvas();
        }
        if (this.delayOver) {
            this.drawHolder();
        }
        if (mouseIsPressed) {
            this.backToMainMenu();
        }
    };
    Scoreboard.prototype.drawHolder = function () {
        this.drawBackground();
        this.drawOldTargetCanvas();
        this.drawText();
        this.drawWinnerList();
    };
    Scoreboard.prototype.drawBackground = function () {
        push();
        this.fadeCounter += 0.2;
        background(this.fadeCounter % 255);
        pop();
    };
    Scoreboard.prototype.drawOldTargetCanvas = function () {
        push();
        image(this.targetCanvasCutoutImage, windowWidth / 4, windowHeight / 16);
        pop();
    };
    Scoreboard.prototype.drawText = function () {
        push();
        textSize(30);
        fill('black');
        text('Click to restart', windowWidth / 2, windowHeight / 2);
        pop();
    };
    Scoreboard.prototype.fadeOutOldCanvas = function () {
        push();
        this.fadeCounter += 0.2;
        fill(0, 0, 0, this.fadeCounter);
        rect(0, 0, windowWidth, windowHeight);
        pop();
    };
    Scoreboard.prototype.backToMainMenu = function () {
        this.hasRun = false;
        this.delayOver = false;
        this.fadeCounter = 0;
        this.targetCanvasCutoutImage = new p5.Image();
        this.restartGame = true;
    };
    Object.defineProperty(Scoreboard.prototype, "getRestartGame", {
        get: function () {
            return this.restartGame;
        },
        enumerable: true,
        configurable: true
    });
    Scoreboard.prototype.countPixelsInTarget = function (targetImage) {
        targetImage.loadPixels();
        this.totalPixelsInCanvas = targetImage.pixels.length / 4;
        var blue = 0;
        var green = 0;
        var purple = 0;
        var yellow = 0;
        for (var i = 0; targetImage.pixels.length > i; i += 4) {
            if (targetImage.pixels[i] === 74 && targetImage.pixels[i + 1] === 124 && targetImage.pixels[i + 2] === 221) {
                blue++;
            }
            if (targetImage.pixels[i] === 102 && targetImage.pixels[i + 1] === 233 && targetImage.pixels[i + 2] === 69) {
                green++;
            }
            if (targetImage.pixels[i] === 202 && targetImage.pixels[i + 1] === 94 && targetImage.pixels[i + 2] === 211) {
                purple++;
            }
            if (targetImage.pixels[i] === 231 && targetImage.pixels[i + 1] === 255 && targetImage.pixels[i + 2] === 87) {
                yellow++;
            }
        }
        this.colorScoreList.push({ playerColor: 'blue', pixelCount: blue });
        this.colorScoreList.push({ playerColor: 'green', pixelCount: green });
        this.colorScoreList.push({ playerColor: 'purple', pixelCount: purple });
        this.colorScoreList.push({ playerColor: 'yellow', pixelCount: yellow });
        this.colorScoreList.sort(function (a, b) { return (b.pixelCount - a.pixelCount); });
    };
    Scoreboard.prototype.drawWinnerList = function () {
        if (this.scoreBarCounter <= 1) {
            this.scoreBarCounter += 0.003;
        }
        var scoreBarWidth = windowWidth * 0.2;
        scoreBarWidth = scoreBarWidth / (this.colorScoreList[0].pixelCount / this.totalPixelsInCanvas);
        push();
        fill('blue');
        textSize(40);
        textAlign(RIGHT, TOP);
        noStroke();
        var spaceBetweenText = 0;
        if (this.colorScoreList[0].pixelCount !== 0) {
            fill(this.colorScoreList[0].playerColor);
            rect(windowWidth / 2, windowHeight * 0.7 + spaceBetweenText, scoreBarWidth * this.scoreBarCounter * (this.colorScoreList[0].pixelCount / this.totalPixelsInCanvas), 40);
            text("1st: " + this.calcPercentPixels(this.colorScoreList[0].pixelCount) + "% ", windowWidth / 2, windowHeight * 0.7 + spaceBetweenText);
            spaceBetweenText += 50;
        }
        if (this.colorScoreList[1].pixelCount !== 0) {
            fill(this.colorScoreList[1].playerColor);
            rect(windowWidth / 2, windowHeight * 0.7 + spaceBetweenText, scoreBarWidth * this.scoreBarCounter * (this.colorScoreList[1].pixelCount / this.totalPixelsInCanvas), 40);
            text("2nd: " + this.calcPercentPixels(this.colorScoreList[1].pixelCount) + "% ", windowWidth / 2, windowHeight * 0.7 + spaceBetweenText);
            spaceBetweenText += 50;
        }
        if (this.colorScoreList[2].pixelCount !== 0) {
            fill(this.colorScoreList[2].playerColor);
            rect(windowWidth / 2, windowHeight * 0.7 + spaceBetweenText, scoreBarWidth * this.scoreBarCounter * (this.colorScoreList[2].pixelCount / this.totalPixelsInCanvas), 40);
            text("3rd: " + this.calcPercentPixels(this.colorScoreList[2].pixelCount) + "% ", windowWidth / 2, windowHeight * 0.7 + spaceBetweenText);
            spaceBetweenText += 50;
        }
        if (this.colorScoreList[3].pixelCount !== 0) {
            fill(this.colorScoreList[3].playerColor);
            rect(windowWidth / 2, windowHeight * 0.7 + spaceBetweenText, scoreBarWidth * this.scoreBarCounter * (this.colorScoreList[3].pixelCount / this.totalPixelsInCanvas), 40);
            text("4th: " + this.calcPercentPixels(this.colorScoreList[3].pixelCount) + "% ", windowWidth / 2, windowHeight * 0.7 + spaceBetweenText);
            spaceBetweenText += 50;
        }
        var noWinner = 0;
        for (var _i = 0, _a = this.colorScoreList; _i < _a.length; _i++) {
            var colorScoreObj = _a[_i];
            noWinner += colorScoreObj.pixelCount;
        }
        if (noWinner === 0) {
            push();
            fill(128);
            textAlign(CENTER);
            text("No Winner", windowWidth / 2, windowHeight * 0.7 + spaceBetweenText);
            pop();
        }
        pop();
    };
    Scoreboard.prototype.calcPercentPixels = function (inPixels) {
        var percentOut = inPixels / this.totalPixelsInCanvas;
        percentOut = percentOut * 100;
        return percentOut.toFixed(2);
    };
    return Scoreboard;
}());
var StartMenu = (function () {
    function StartMenu(x, y, playerFactory) {
        this.noOfPlayers = 2;
        this.isPlayerPressed = false;
        this.isTimerPressed = false;
        this.bgColor = '#1B1E1A';
        this.playerSelectButton = new _btn.RadioButton(windowWidth / 2, windowHeight / 3, windowWidth / 2, 100, this.bgColor, this.isPlayerPressed, [1, 2, 3], this.noOfPlayers);
        this.startGame = false;
        this.startButton = new _btn.BoolButton(width / 2, windowHeight * .85, 100, 50, 'blue', 'Start', this.startGame);
        this.timerValue = 60;
        this.timerSelectButton = new _btn.RadioButton(windowWidth / 2, windowHeight * .72, windowWidth / 2, 100, this.bgColor, this.isTimerPressed, [45, 60, 90, 120], this.timerValue);
        this.x = x;
        this.y = y;
        this.playerFactory = playerFactory;
    }
    StartMenu.prototype.getStartGame = function () {
        return this.startGame;
    };
    StartMenu.prototype.getPlayers = function () {
        return this.noOfPlayers;
    };
    StartMenu.prototype.getSelectedTime = function () {
        return this.timerValue;
    };
    StartMenu.prototype.update = function () {
        this.startGame = this.startButton.handleMousePressed();
        this.noOfPlayers = this.playerSelectButton.handleMousePressed();
        this.timerValue = this.timerSelectButton.handleMousePressed();
    };
    StartMenu.prototype.draw = function () {
        push();
        fill(0, 0, 0);
        rect(0, 0, windowWidth, windowHeight);
        fill(this.bgColor);
        rect(windowWidth / 5, 0, windowWidth / 1.666, windowHeight);
        textSize(30);
        fill(253, 228, 6);
        textFont('Orbitron, sans-serif');
        textAlign(CENTER);
        text("S", this.x, this.y);
        fill(255, 165, 0);
        text("p", this.x + 20, this.y);
        fill(255, 0, 0);
        text("l", this.x + 38, this.y);
        fill(75, 0, 130);
        text("a", this.x + 50, this.y);
        fill(0, 0, 205);
        text("t", this.x + 65, this.y);
        fill(255, 255, 255);
        textSize(30);
        textFont('Titillium Web, sans-serif');
        text("Color", this.x - 10, this.y - 25);
        pop();
        push();
        var createPlayers = this.playerFactory.buildMenuPlayer(this.noOfPlayers);
        var posIndex = windowWidth / (this.noOfPlayers + 2);
        var startIndex = posIndex / 2;
        createPlayers.forEach(function (player) {
            startIndex += posIndex;
            player.draw(startIndex, windowHeight / 2);
        });
        this.playerSelectButton.draw();
        fill(this.bgColor);
        textAlign(CENTER);
        textSize(40);
        fill(255, 255, 255);
        text("Players", (windowWidth / 2), (windowHeight / 3.8));
        pop();
        push();
        this.timerSelectButton.draw();
        textSize(40);
        textAlign(CENTER);
        fill('white');
        text("Play for " + this.timerValue + " seconds", windowWidth / 2, windowHeight * .65);
        pop();
        this.startButton.draw();
    };
    return StartMenu;
}());
var TargetGameCanvas = (function () {
    function TargetGameCanvas(velX, velY) {
        this.targetCanvasPosX = 0;
        this.targetCanvasPosY = 0;
        this.targetCanvasWidth = 0;
        this.targetCanvasHeight = 0;
        this.targetCanvasDirection = false;
        this.cutOutImage = new p5.Image();
        this.velX = velX;
        this.velY = velY;
        this.splashList = [];
        this.setTargetCanvasSize();
    }
    TargetGameCanvas.prototype.draw = function () {
        this.updatePos();
        this.drawTargetBoard();
        this.drawSplash();
        this.drawFrameAroundTargetCanvas();
        this.drawCloud(windowWidth * 0.75, this.targetCanvasPosY / 2);
        this.drawLogo(windowWidth / 4, windowHeight / 8);
    };
    TargetGameCanvas.prototype.setTargetCanvasSize = function () {
        this.targetCanvasWidth = windowWidth / 2;
        this.targetCanvasHeight = windowHeight / 2;
        this.targetCanvasPosY = windowHeight / 4;
    };
    TargetGameCanvas.prototype.drawTargetBoard = function () {
        push();
        noStroke();
        fill(255);
        rect(this.targetCanvasPosX, this.targetCanvasPosY, this.targetCanvasWidth, this.targetCanvasHeight);
        pop();
    };
    TargetGameCanvas.prototype.drawSplash = function () {
        push();
        for (var _i = 0, _a = this.splashList; _i < _a.length; _i++) {
            var splash = _a[_i];
            noStroke();
            fill("rgb(" + splash.color + ")");
            circle(splash.posX + this.targetCanvasPosX, splash.posY, splash.splashDiameter);
        }
        pop();
    };
    TargetGameCanvas.prototype.drawFrameAroundTargetCanvas = function () {
        push();
        noStroke();
        fill(20, 50, 100);
        rect(0, 0, windowWidth, this.targetCanvasPosY);
        rect(0, this.targetCanvasPosY + this.targetCanvasHeight, windowWidth, windowHeight - (this.targetCanvasPosY + this.targetCanvasHeight));
        rect(0, this.targetCanvasPosY - 1, this.targetCanvasPosX, this.targetCanvasHeight + 2);
        rect(this.targetCanvasPosX + this.targetCanvasWidth, this.targetCanvasPosY - 1, windowWidth - (this.targetCanvasPosX + this.targetCanvasWidth), this.targetCanvasHeight + 2);
        pop();
    };
    TargetGameCanvas.prototype.drawCloud = function (xPos, yPos) {
        push();
        noStroke();
        fill('white');
        ellipse(xPos, yPos, 55, 65);
        ellipse(xPos + 30, yPos - 10, 55, 65);
        ellipse(xPos + 80, yPos, 55, 65);
        ellipse(xPos + 20, yPos + 20, 55, 65);
        ellipse(xPos + 60, yPos + 20, 55, 65);
        pop();
    };
    TargetGameCanvas.prototype.drawLogo = function (logoX, logoY) {
        push();
        textSize(30);
        fill(253, 228, 6);
        textFont('Orbitron, sans-serif');
        textAlign(CENTER);
        text("S", logoX, logoY);
        fill(255, 165, 0);
        text("p", logoX + 20, logoY);
        fill(255, 0, 0);
        text("l", logoX + 38, logoY);
        fill(75, 0, 130);
        text("a", logoX + 50, logoY);
        fill(0, 0, 205);
        text("t", logoX + 65, logoY);
        fill(255, 255, 255);
        textSize(30);
        textFont('Titillium Web, sans-serif');
        text("Color", logoX - 10, logoY - 25);
        pop();
    };
    TargetGameCanvas.prototype.updatePos = function () {
        var moveBand = windowWidth / 2;
        var canvasSpeed = 1;
        if (this.targetCanvasPosX > moveBand) {
            this.targetCanvasDirection = true;
        }
        else if (this.targetCanvasPosX <= 0) {
            this.targetCanvasDirection = false;
        }
        if (this.targetCanvasPosX >= 0 && this.targetCanvasDirection == false) {
            this.targetCanvasPosX += canvasSpeed;
        }
        else if (this.targetCanvasDirection == true) {
            this.targetCanvasPosX -= canvasSpeed;
        }
    };
    TargetGameCanvas.prototype.isMissileInsideTarget = function (hitPosX, hitPosY, splashColor, splashDiameter) {
        if (hitPosX > this.targetCanvasPosX - splashDiameter / 2 && hitPosX < this.targetCanvasPosX + this.targetCanvasWidth + splashDiameter / 2
            && hitPosY > this.targetCanvasPosY - splashDiameter / 2 && hitPosY < this.targetCanvasPosY + this.targetCanvasHeight + splashDiameter / 2) {
            this.splashList.push({ posX: hitPosX - this.targetCanvasPosX, posY: hitPosY, color: splashColor, splashDiameter: splashDiameter });
        }
        else {
        }
        if (this.splashList.length > 200) {
            this.splashList.shift();
        }
    };
    TargetGameCanvas.prototype.addSplashToTargetCanvas = function (splash) {
        this.isMissileInsideTarget(splash.posX, splash.posY, splash.color, splash.splashDiameter);
    };
    TargetGameCanvas.prototype.cutOutTargetCanvas = function () {
        this.cutOutImage = get(this.targetCanvasPosX, this.targetCanvasPosY, this.targetCanvasWidth, this.targetCanvasHeight);
    };
    Object.defineProperty(TargetGameCanvas.prototype, "getCutoutImage", {
        get: function () {
            this.cutOutTargetCanvas();
            return this.cutOutImage;
        },
        enumerable: true,
        configurable: true
    });
    TargetGameCanvas.prototype.getSplashList = function () {
        return this.splashList;
    };
    return TargetGameCanvas;
}());
var Timer = (function () {
    function Timer(timer, posX, posY) {
        var _this = this;
        this.min = 0;
        this.downloadTimer = setInterval(function () {
            _this.timer--;
            if (_this.timer === 0) {
                clearInterval(_this.downloadTimer);
            }
        }, 1000);
        this.timer = timer;
        this.posX = posX;
        this.posY = posY;
    }
    Timer.prototype.draw = function () {
        this.min = floor(this.timer / 60);
        fill(255, 255, 255, 0);
        fill('white');
        textSize(100);
        if (this.timer != 0 && this.timer < 10) {
            text(this.timer, this.posX, this.posY + 18);
        }
        else if (this.timer != 0 && this.timer < 60) {
            push();
            textAlign(CENTER);
            text(this.timer, this.posX, this.posY + 18);
            pop();
        }
        else if (this.timer != 0 && this.timer >= 60) {
            push();
            textAlign(CENTER);
            if (this.timer - 60 * this.min != 0 && this.timer - 60 * this.min >= 10) {
                text(this.min + " : " + (this.timer - (60 * this.min)), this.posX, this.posY + 18);
            }
            else if (this.timer - 60 * this.min != 0 && this.timer - 60 * this.min < 10) {
                text(this.min + " : " + "0" + (this.timer - (60 * this.min)), this.posX, this.posY + 18);
            }
            else {
                text(this.min + " : " + "00", this.posX, this.posY + 18);
            }
            pop();
        }
        else {
            textAlign(CENTER);
            text('Game over', this.posX, this.posY + 18);
        }
    };
    Object.defineProperty(Timer.prototype, "getTimeLeft", {
        get: function () {
            return this.timer;
        },
        enumerable: true,
        configurable: true
    });
    return Timer;
}());
var gameController;
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);
    fullscreen();
    gameController = new GameController();
}
function draw() {
    gameController.updateGame();
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
//# sourceMappingURL=bundle.js.map