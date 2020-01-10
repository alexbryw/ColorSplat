class StartMenu implements DrawableObject {
    // Class attribute
    private playerFactory: PlayerFactory
    private noOfPlayers = 2
    private isPlayerPressed = false
    private isTimerPressed = false
    private bgColor = '#1B1E1A'
    private playerSelectButton = new _btn.RadioButton(windowWidth/2, windowHeight/3, windowWidth/2, 100, this.bgColor, this.isPlayerPressed, [1, 2, 3, 4], this.noOfPlayers);
    private startGame = false 
    private startButton = new _btn.BoolButton(width/2, windowHeight*.85, 100, 50, 'blue', 'Start', this.startGame)
    private timerValue = 60
    private timerSelectButton = new _btn.RadioButton(windowWidth/2, windowHeight*.72, windowWidth/2, 100, this.bgColor, this.isTimerPressed, [45, 60, 90, 120], this.timerValue)
    private x: number
    private y: number
    
    // Class constructor
    constructor (x: number, y: number, playerFactory: PlayerFactory) {
        this.x = x
        this.y = y
        this.playerFactory = playerFactory
    }

    public getStartGame(): boolean{
        return this.startGame
    }

    public getPlayers(): number {
        return this.noOfPlayers
    }

    public getSelectedTime(): number {
        return this.timerValue
    }

    public update(): void {
        this.startGame = this.startButton.handleMousePressed()
        this.noOfPlayers = this.playerSelectButton.handleMousePressed()   
        this.timerValue = this.timerSelectButton.handleMousePressed()   
    }

    // Class functions
    public draw(): void {
        push()
        //draw background
        fill(0, 0, 0)
        rect(0,0, windowWidth, windowHeight);
        
        //draw menubody
        fill(this.bgColor)
        rect(windowWidth/5, 0, windowWidth/1.666, windowHeight)
        
        //draw game-logo
        textSize(30);
        fill(253, 228, 6);
        textFont('Orbitron, sans-serif');
        textAlign(CENTER)
        text("S", this.x, this.y);
        fill(255,165,0);
        text("p", this.x + 20, this.y);
        fill(255,0,0);
        text("l", this.x + 38, this.y);
        fill(75,0,130);
        text("a", this.x + 50, this.y);
        fill(0,0,205);
        text("t", this.x + 65, this.y);
        fill(255,255,255);
        textSize(30)
        textFont('Titillium Web, sans-serif');
        text("Color", this.x - 10, this.y - 25);
        pop()
        
        //Draw players section
        push()
        const createPlayers: Array<_ply.MenuPlayer> = this.playerFactory.buildMenuPlayer(this.noOfPlayers)

        let posIndex = windowWidth/(this.noOfPlayers+2)
        let startIndex = posIndex/2
        createPlayers.forEach(player => {
            startIndex+=posIndex
            player.draw(startIndex, windowHeight/2)
        });
        this.playerSelectButton.draw()
        fill(this.bgColor)
        textAlign(CENTER)
        textSize(40)
        fill(255, 255, 255)
        text("Players", (windowWidth/2), (windowHeight/3.8));
        pop()

        //Draw timer settings
        push()
        this.timerSelectButton.draw()
        textSize(40)
        textAlign(CENTER)
        fill('white')
        text(`Play for ${this.timerValue} seconds`, windowWidth/2, windowHeight*.65)
        pop()

        //Draw startbutton
        this.startButton.draw()
    }
}

