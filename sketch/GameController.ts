class GameController {
    // Class attributes //
    private startMenu = new StartMenu(width / 2, height * 1 / 7);
    private isGameStarted = false
    private isGameOver = false
    private target = new TargetGameCanvas(windowWidth / 2, windowHeight / 2);
    private collidableObjectManager = new CollidableObjectManager(this.target);
    private timerCreated = false
    private timer: Timer = new Timer(1,1,1)
    private playerFactory = new PlayerFactory(this.collidableObjectManager)
    private builtPlayers = false
    private buildGamePlayers: Array<_ply.GamePlayer> = []
    private powerUpExists = false
    private powerUp?: PowerUp

    // private scoreboard = new Scoreboard(true)
    // private projectiles: PlayerProjectile[] = []

    private scoreboard = new Scoreboard(this.target);
    // private target = new TargetGameCanvas( Behöver velX värde och velY värde );
    // private projectile = new PlayerProjectile( Behöver velX värde och velY värde );
    // private powerUp = new PowerUp( Behöver velX värde och velY värde );

    // Class methods //

    public updateGame(): void {
        // Draw startmenu unless game has started
        if (!this.isGameStarted) {
            this.startMenu.draw()
            this.startMenu.update()
            this.isGameStarted = this.startMenu.getStartGame()
        }
        // Draw main game
        else if (this.isGameStarted && !this.isGameOver) {
            // If timer isn't created, create timer object
            // let randomNumber: Number = floor(random(0, 400))
            // if (randomNumber == 200) {
            //     if (!this.powerUpExists) {
            //         this.powerUp = new PowerUp(random(0,windowWidth), -50, 10, 10, 25, '#1aff1a', this.collidableObjectManager)
            //         this.collidableObjectManager.addCollidableObjectToList(this.powerUp)
            //         // this.powerUpExists = true
            //         this.powerUp.draw()
            //         console.log(randomNumber)

            this.generatePowerUps()
            this.powerUpExists = false

            for (const iterator of this.collidableObjectManager.getCollidableObjectList()) {
                if (iterator instanceof PowerUp) {
                    this.powerUpExists = true
                }
            }

            if (!this.powerUpExists) {
                console.log("no powerups")
            }

            if (!this.powerUpExists) {
                this.powerUp = new PowerUp(random(0, windowWidth), -50, 10, 10, 25, '#1aff1a', this.collidableObjectManager, 'SpeedCanon') // TODO...
                this.collidableObjectManager.addCollidableObjectToList(this.powerUp)
                // this.powerUpExists = true
                this.powerUp.draw()
                //console.log(randomNumber)
            }

            if (!this.timerCreated) {
                this.timer = new Timer(this.startMenu.getSelectedTime(), width / 2, height * 1 / 6);
                this.timerCreated = true
            }



            // If gameplayers aren't created, create gameplayer objects
            if (!this.builtPlayers) {
                let posIndex = windowWidth / (this.startMenu.getPlayers() + 2)
                let startIndex = posIndex / 2
                let posArray = []
                // Find positions for players and pass into the player objects as posArray
                for (let i = 0; i < this.startMenu.getPlayers(); i++) {
                    startIndex += posIndex
                    posArray.push({ x: startIndex, y: windowHeight })
                }
                this.buildGamePlayers = this.playerFactory.buildGamePlayer(this.startMenu.getPlayers(), posArray)
                this.builtPlayers = true
            }

            // Draw target and update target
            this.target.draw()
            this.target.updatePos()

            // Draw timer
            this.timer.draw()

            // Draw players, update players and maintain player controls
            this.buildGamePlayers.forEach(player => {
                player.draw()
                player.handleControls()
                if (keyIsDown(player.aimLeft[1]) || keyIsDown(player.aimRight[1]) || keyIsDown(player.fireButton[1])) {
                    player.update()
                }
            });

            this.collidableObjectManager.updatePos();
            this.collidableObjectManager.draw();

            if (this.timer.getTimeLeft === 0) {
                this.isGameOver = true
            }
        }

        else if (this.isGameOver) {

            if (this.scoreboard.getRestartGame) {// restart game
                this.isGameOver = false;
                this.isGameStarted = false;
                this.scoreboard.restartGame = false;
                this.target = new TargetGameCanvas(windowWidth / 2, windowHeight / 2);
                this.timer = new Timer(50, width / 2, height * 1 / 6);
                this.builtPlayers = false;
                this.timerCreated = false

                // Ska spelare skapas på nytt? Eller går det att återanvända gamla spelare?
                // this.buildGamePlayers = this.playerFactory.buildGamePlayer(this.startMenu.getPlayers());
                this.buildGamePlayers = [];
                this.collidableObjectManager = new CollidableObjectManager(this.target);
                this.startMenu = new StartMenu(width / 2, height * 1 / 7);
                this.playerFactory = new PlayerFactory(this.collidableObjectManager);
                this.scoreboard = new Scoreboard(this.target);
            }
            else {
                this.scoreboard.draw();
            }
        }
        // this.checkCollisions()
    }

    private generatePowerUps() {
        this.powerUpExists = false
        for (const iterator of this.collidableObjectManager.getCollidableObjectList()) {
            if (iterator instanceof PowerUp) {
                this.powerUpExists = true

            }
        }

        if (!this.powerUpExists) {
            console.log("no powerups")
        }

        let randomNumber = Math.round(random(0,1))

        let powerUpString: PowerUpType
        
        if (randomNumber == 0){
            powerUpString = 'SpeedCanon'
        }
        
        else {
        powerUpString = 'SuperBlast'
        }
        console.log(powerUpString)

        if (!this.powerUpExists) {
            const powerUp = new PowerUp(random(0, windowWidth), -50, 10, 10, 25, '#1aff1a', this.collidableObjectManager, powerUpString )
            this.collidableObjectManager.addCollidableObjectToList(powerUp)
            // this.powerUpExists = true
            powerUp.draw()
            this.powerUp = powerUp
            //console.log(randomNumber)
        }
    }

    // private checkCollisions() {
    //     for (const projectile of this.projectiles) {
    //         for (const otherProjectile of this.projectiles) {
    //             projectile.checkCollision(otherProjectile)
    //         }
    //     }
    // }

    //     public mouseClicked(){
    //         //console.log('mouse clicked')
    //         this.target.mouseClicked();
    //     }

    //     public cannonPlayer() {
    //         const colors: Array<string> = ["Pink", "Blue", "Green", "Red"]

    //         let position: number = windowWidth / this.noOfPlayers

    //         const baseMargin = position
    //         const movePlayer = position / 2
    //         for (let i = 0; i < this.noOfPlayers; i++) {
    //             let cannons = new PlayerBody(colors[i], position - movePlayer, windowHeight)
    //             position += baseMargin
    //             cannons.draw()

    //         }
    //     }

    //     public powerUp() {
    //         // if (second() < 20 && second() > 10) {
    //         //     this.powerup.draw()
    //         //     this.powerup.updatePos()
    //         // }
    //         // if (second() < 40 && second() > 30) {
    //             this.powerup.draw()
    //             this.powerup.updatePos()
    //         // }
    //     }
    // }
}
