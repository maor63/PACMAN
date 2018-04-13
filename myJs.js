
var context = canvas.getContext("2d");
var movingScore ;
var ghost;
var pacman_position = new Object();
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;
var pacman_lives = 3;
var direction = DrawPacmanRight;
var Direction = Object.freeze({UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4});
var GameItems = Object.freeze({BLACK_FOOD: 1, PACMAN: 2, BLANK: 0, OBSTACLE: 4, GHOST: 5});

Start();

function Start() {
    ghost = new Ghost(0, 0, "green");
    movingScore= new MovingScore(5, 0, "blue");
    board = new Array();
    score = 0;
    pac_color = "yellow";
    var cnt = 100;
    var food_remain = 50;
    var pacman_remain = 1;
    //Init the board: put pacman, obstacles and food
    start_time = new Date();
    for (var i = 0; i < 10; i++) {
        board[i] = new Array();
        //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
        for (var j = 0; j < 10; j++) {
            // if (i == 0 && j == 0) {
            //     board[i][j] = GameItems.GHOST;
            // }
            if ((i == 3 && j == 3) || (i == 3 && j == 4) || (i == 3 && j == 5) || (i == 6 && j == 1) || (i == 6 && j == 2)) {
                board[i][j] = GameItems.OBSTACLE;
            }
            // put pacman and food at random places
            else {
                var randomNum = Math.random();
                if (randomNum <= 1.0 * food_remain / cnt) {
                    food_remain--;
                    board[i][j] = GameItems.BLACK_FOOD;
                } else if (randomNum < 1.0 * (pacman_remain + food_remain) / cnt) {
                    pacman_position.i = i;
                    pacman_position.j = j;
                    pacman_remain--;
                    board[i][j] = GameItems.PACMAN;
                } else {
                    board[i][j] = GameItems.BLANK;
                }
                cnt--;
            }
        }
    }
    //Put all remaining food on the board
    while (food_remain > 0) {
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 1;
        food_remain--;
    }
    //Init listeners to identify keyboard clicks
    keysDown = {};
    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);
    addEventListener("keyup", function (e) {
        keysDown[e.keyCode] = false;
    }, false);
    //Update pacman position on the board every 250ms
    interval = setInterval(UpdatePosition, 150);
}

//Find random empty cell on 10x10 board  (the 9 need to be variable)
function findRandomEmptyCell(board) {
    var i = Math.floor((Math.random() * 9) + 1);
    var j = Math.floor((Math.random() * 9) + 1);
    while (board[i][j] != 0) {
        i = Math.floor((Math.random() * 9) + 1);
        j = Math.floor((Math.random() * 9) + 1);
    }
    return [i, j];
}

function GetKeyPressed() {
    //Up arrow
    if (keysDown[38]) {
        return Direction.UP;
    }
    //Down arrow
    if (keysDown[40]) {
        return Direction.DOWN;
    }
    //Left arrow
    if (keysDown[37]) {
        return Direction.LEFT;
    }
    //Right arrow
    if (keysDown[39]) {
        return Direction.RIGHT;
    }
}

function DrawPacmanEye(x, y) {
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI); // circle
    context.fillStyle = "black"; //color
    context.fill();
}

function DrawPacman(center, startAngle, endAngle) {
    context.beginPath();
    context.arc(center.x, center.y, 30, startAngle, endAngle); // half circle
    context.lineTo(center.x, center.y);
    context.fillStyle = pac_color; //color
    context.fill();

}

function DrawPacmanRight(center) {
    DrawPacman(center, 0.15 * Math.PI, 1.85 * Math.PI);
    DrawPacmanEye(center.x + 5, center.y - 15);
}

function DrawPacmanLeft(center) {
    DrawPacman(center, 1.15 * Math.PI, 0.85 * Math.PI);
    DrawPacmanEye(center.x + 5, center.y - 15);
}

function DrawPacmanDown(center) {
    DrawPacman(center, 0.65 * Math.PI, 2.35 * Math.PI, true);
    DrawPacmanEye(center.x + 15, center.y + 5);
}

function DrawPacmanUp(center) {
    DrawPacman(center, 1.65 * Math.PI, 1.35 * Math.PI);
    DrawPacmanEye(center.x + 15, center.y + 5);
}

function DrawBlackFood(center) {
    context.beginPath();
    context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
    context.fillStyle = "black"; //color
    context.fill();
}

function DrawObstacle(center) {
    context.beginPath();
    context.rect(center.x - 30, center.y - 30, 60, 60);
    context.fillStyle = "grey"; //color
    context.fill();
}

//Draw the board(Array) on the canvas
function Draw(DrawPacmanDirection) {
    canvas.width = canvas.width; //clean board
    lblScore.value = score; //lbl = label
    lblTime.value = time_elapsed;
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            var center = new Object();
            center.x = i * 60 + 30;
            center.y = j * 60 + 30;
            if (board[i][j] == GameItems.PACMAN) {//2 means pacman
                DrawPacmanDirection(center);
            } else if (board[i][j] == GameItems.BLACK_FOOD) {//1 means food
                DrawBlackFood(center);
            }
            else if (board[i][j] == GameItems.OBSTACLE) { // 4 means obstacle
                DrawObstacle(center);
            }

        }
    }
    context.beginPath();
    context.fillStyle = movingScore.color; //color
    context.fillRect(movingScore.x * 60 + 15, movingScore.y * 60 + 15, 30, 30)
    context.fill();

    context.beginPath();
    context.fillStyle = ghost.color; //color
    context.fillRect(ghost.x * 60 + 15, ghost.y * 60 + 15, 30, 30)
    context.fill();

}

function UpdatePosition() {
    board[pacman_position.i][pacman_position.j] = 0;
    var moved = false;
    var x = GetKeyPressed()
    if (x == Direction.UP) {//Up
        if (pacman_position.j > 0 && board[pacman_position.i][pacman_position.j - 1] != GameItems.OBSTACLE) {//Check if not obstacle or out the boarder
            pacman_position.j--;
            direction = DrawPacmanUp;
            moved = true;
        }
    }
    if (x == Direction.DOWN) {//Down
        if (pacman_position.j < 9 && board[pacman_position.i][pacman_position.j + 1] != GameItems.OBSTACLE) {
            pacman_position.j++;
            direction = DrawPacmanDown;
            moved = true;
        }
    }
    if (x == Direction.LEFT) {//Left
        if (pacman_position.i > 0 && board[pacman_position.i - 1][pacman_position.j] != GameItems.OBSTACLE) {
            pacman_position.i--;
            direction = DrawPacmanLeft;
            moved = true;
        }
    }
    if (x == Direction.RIGHT) {//Right
        if (pacman_position.i < 9 && board[pacman_position.i + 1][pacman_position.j] != GameItems.OBSTACLE) {
            pacman_position.i++;
            direction = DrawPacmanRight;
            moved = true;
        }
    }
    if (board[pacman_position.i][pacman_position.j] == GameItems.BLACK_FOOD) { //pacman eat food
        score += 5;
    }
    board[pacman_position.i][pacman_position.j] = GameItems.PACMAN; // put pacman

    if (board[ghost.x][ghost.y] == GameItems.PACMAN) {
        if (pacman_lives == 0) {
            window.clearInterval(interval);
            window.alert("Game Over");
            return;
        }
        else {
            window.clearInterval(interval);
            pacman_lives--;
            window.alert("You Lose!!!!!!!!!!! " + pacman_lives + " life left");
            Start();
        }
    }

    ghost.NextMove();
    movingScore.NextMove();
    var currentTime = new Date();
    time_elapsed = (currentTime - start_time) / 1000;
    if (score >= 20 && time_elapsed <= 10) {//Change pacman color to green if you play well
        pac_color = "green";
    }
    if (score == 50) {//game ended
        window.clearInterval(interval);
        window.alert("Game completed");
    }
    else {
        Draw(direction);
    }
}

function MovingScore(x, y, color) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.NextMove = function () {
        var randomNum = Math.floor((Math.random() * 4) + 1);
       if (randomNum == Direction.UP) {//Up
            if (this.y > 0 && board[this.x][this.y - 1] != GameItems.OBSTACLE) {//Check if not obstacle or out the boarder
                this.y--;
            }
        }
        if (randomNum == Direction.DOWN) {//Down
            if (this.y < 9 && board[this.x][this.y + 1] != GameItems.OBSTACLE) {
                this.y++;
            }
        }
        if (randomNum == Direction.LEFT) {//Left
            if (this.x > 0 && board[this.x - 1][this.y] != GameItems.OBSTACLE) {
                this.x--;
            }
        }
        if (randomNum == Direction.RIGHT) {//Right
            if (this.x < 9 && board[this.x + 1][this.y] != GameItems.OBSTACLE) {
                this.x++;
            }
        }
    }
}

function Ghost(x, y, color) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.track = new Array();
    this.CalcTrack = function () {
        this.track = DFS(new Node(this.x, this.y));
    }

    this.NextMove = function () {
        if(this.track.length >0){
            var pos = this.track.pop();
            this.x = pos.x;
            this.y = pos.y;
        }
        else {
            this.CalcTrack();
        }
    }
}

function Node(x, y, pre) {
    this.x = x;
    this.y = y;
    this.preNode = pre;
}

function DFS(Start){
    var graph = $.extend(true, [], board);
    graph[pacman_position.i][pacman_position.j] = GameItems.PACMAN;
    var stack = new Array();
    stack.push(Start);
    while (stack.length > 0){
        var node = stack.pop();
        if(board[node.x][node.y] == GameItems.PACMAN){
            var track = new Array();
            while (node.preNode != null){
                track.push(node);
                node = node.preNode
            }
            return track;
        }
        var childrens = Expand(node, graph);
        jQuery.each( childrens, function( i, child ) {
            // graph[child.x][child.y] = -1;
            stack.push(child);
        });
        graph[node.x][node.y] = -1;
    }
    return new Array();
}

function Expand(node, graph) {
    var children = new Array();
    if (node.y > 0 && graph[node.x][node.y - 1] != GameItems.OBSTACLE && graph[node.x][node.y - 1] != -1) {
        children.push(new Node(node.x, node.y - 1, node));
        graph[node.x][node.y - 1] = -1;
    }

    if (node.y < 9 && graph[node.x][node.y + 1] != GameItems.OBSTACLE&& graph[node.x][node.y + 1] != -1) {
        children.push(new Node(node.x, node.y + 1, node));
        graph[node.x][node.y + 1] = -1;
    }

    if (node.x > 0 && graph[node.x - 1][node.y] != GameItems.OBSTACLE&& graph[node.x - 1][node.y] != -1) {
        children.push(new Node(node.x - 1, node.y, node));
        graph[node.x - 1][node.y] = -1;
    }

    if (node.x < 9 && graph[node.x + 1][node.y] != GameItems.OBSTACLE&& graph[node.x + 1][node.y] != -1) {
        children.push(new Node(node.x + 1, node.y, node));
        graph[node.x + 1][node.y] = -1;
    }
    return children;
}
