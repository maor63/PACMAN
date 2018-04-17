var context;
var movingScore;
var ghosts;
var pacman_position;
var board = [];
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;
var pacman_lives;
var direction = DrawPacmanRight;
var Direction = Object.freeze({UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4});
var GameItems = Object.freeze({
    RED_FOOD: 1,
    PACMAN: 2,
    BLANK: 0,
    OBSTACLE: 4,
    GHOST: 5,
    YELLOW_FOOD: 7,
    ORANGE_FOOD: 6,
    HEART: 3
});
var board_height = 10;
var board_width = 15;
var total_food = 80;
var remain_food;
var ghosts_number;
var heart;
var clock;

var currentUser;
var loop_iterval = 150;
//[type=text],input[type=password], input[type=number],input[type=email]


function InitGhosts() {
    ghosts = [];
    ghosts.push(new Ghost(0, 0, "Gallery/monster1.png"));
    if (ghosts_number > 1)
        ghosts.push(new Ghost(0, board_height - 1, "Gallery/monster2.png"));
    if (ghosts_number > 2)
        ghosts.push(new Ghost(board_width - 1, 0, "Gallery/monster3.png"));
}

function Start() {
    heart = {};
    clock = {};
    pacman_lives = 3;
    showSection("gameBoard");
    total_food = parseInt(document.getElementById('balls').value);
    ghosts_number = parseInt(document.getElementById('ghosts').value);
    time_elapsed = parseInt(document.getElementById('duration').value);
    context = canvas.getContext("2d");
    pacman_position = new Object();

    InitGhosts();
    movingScore = new MovingScore(5, 0, "Gallery/Pineapple.png");
    board = new Array();
    score = 0;
    pac_color = "yellow";
    var cnt = 200;
    var food_remain = total_food;
    remain_food = total_food;
    var pacman_remain = 1;
    //Init the board: put pacman, obstacles and food
    start_time = new Date();

    //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)

    for (var i = 0; i < board_width; i++) {
        board[i] = new Array();
        for (var j = 0; j < board_height; j++) {
            if ((i == 3 && j == 3) || (i == 3 && j == 4) || (i == 3 && j == 5) || (i == 6 && j == 1) || (i == 6 && j == 2)) {
                board[i][j] = GameItems.OBSTACLE;
            }
            // put pacman and food at random places
            else {
                var randomNum = Math.random();
                if (randomNum <= 1.0 * food_remain / cnt) {
                    food_remain--;
                    board[i][j] = GameItems.RED_FOOD;
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
    var emptyCell;
    if (pacman_remain > 0) {
        emptyCell = findRandomEmptyCell(board);
        pacman_position.i = emptyCell[0];
        pacman_position.j = emptyCell[1];

    }
    emptyCell = findRandomEmptyCell(board);
    heart = {};
    heart.image = new Image();
    heart.alive = true;
    heart.image.src = "Gallery/heart.png";
    heart.x = emptyCell[0];
    heart.y = emptyCell[1];
    board[heart.x][heart.y] = GameItems.HEART;

    emptyCell = findRandomEmptyCell(board);
    clock = {};
    clock.image = new Image();
    clock.alive = true;
    clock.image.src = "Gallery/clock.png";
    clock.x = emptyCell[0];
    clock.y = emptyCell[1];


    while (food_remain > 0) {
        emptyCell = findRandomEmptyCell(board);
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
    $(document).ready(function () {
        interval = setInterval(UpdatePosition, loop_iterval);
    });
}

//Find random empty cell on 10x10 board  (the 9 need to be variable)
function findRandomEmptyCell(board) {
    var i = Math.floor((Math.random() * (board_width - 1)) + 1);
    var j = Math.floor((Math.random() * (board_height - 1)) + 1);
    while (board[i][j] != 0) {
        i = Math.floor((Math.random() * (board_width - 1)) + 1);
        j = Math.floor((Math.random() * (board_height - 1)) + 1);
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
    context.fillStyle = "black"; //image
    context.fill();
}

function DrawPacman(center, startAngle, endAngle) {
    context.beginPath();
    context.arc(center.x, center.y, 30, startAngle, endAngle); // half circle
    context.lineTo(center.x, center.y);
    context.fillStyle = pac_color; //image
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

function DrawFood(center, color) {
    context.beginPath();
    context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
    context.fillStyle = color; //image
    //context.fillText("10",10,90);
    context.fill();

}

function DrawObstacle(center) {
    context.beginPath();
    context.rect(center.x - 30, center.y - 30, 60, 60);
    context.fillStyle = "grey"; //image
    context.fill();
}

function DrawGhost(ghost) {
    context.drawImage(ghost.image,ghost.x * 60,ghost.y * 60,60,60);
}

//Draw the board(Array) on the canvas
function Draw() {
    canvas.width = canvas.width; //clean board
    lblScore.value = score; //lbl = label
    lblTime.value = time_elapsed;
    lblUser.value = currentUser;
    lblLife.value = pacman_lives;
    for (var i = 0; i < board_width; i++) {
        for (var j = 0; j < board_height; j++) {
            var center = new Object();
            center.x = i * 60 + 30;
            center.y = j * 60 + 30;
            if (board[i][j] == GameItems.PACMAN) {//2 means pacman
                direction(center);
            } else if (board[i][j] == GameItems.RED_FOOD) {//1 means food
                DrawFood(center, "red");
            }
            else if (board[i][j] == GameItems.OBSTACLE) { // 4 means obstacle
                DrawObstacle(center);
            }

        }
    }
    if(clock.alive){
        context.drawImage(clock.image, clock.x * 60, clock.y * 60, 60, 60);
    }
    if(heart.alive) {
        context.drawImage(heart.image, heart.x * 60, heart.y * 60, 60, 60);
    }
    if (movingScore.alive) {
        context.drawImage(movingScore.image ,movingScore.x * 60,movingScore.y * 60,60,60);
    }
    $.each(ghosts, function (i, ghost) {
        DrawGhost(ghost);
    });


}

function GameOver() {
    window.alert("Game Over");
    window.clearInterval(interval);
    showSection("welcome")
}

function GhostEatsPacman() {
    if (pacman_lives == 0) {
        GameOver();
        //return;
    }
    else {
        pacman_lives--;
        window.alert("You Lose!!!!!!!!!!! " + pacman_lives + " life left");
        start_time = new Date();
        InitGhosts();
    }
}

function CheckCollisions() {
    var dead = false;
    if (movingScore.alive && board[movingScore.x][movingScore.y] == GameItems.PACMAN) { // pacman eats moving score
        score += 50;
        movingScore.alive = false;
        movingScore.x = -1;
        movingScore.y = -1;
    }

    if (heart.alive && board[heart.x][heart.y] == GameItems.PACMAN) { // pacman eats moving score
        pacman_lives++;
        heart.alive = false;
    }

    if (clock.alive && board[clock.x][clock.y] == GameItems.PACMAN) { // pacman eats moving score
        time_elapsed += 10;
        clock.alive = false;
    }

    $.each(ghosts, function (i, ghost) {
        if (board[ghost.x][ghost.y] == GameItems.PACMAN) { //ghost eats pacman score

            dead = true;
        }
    });
    return dead;
}

function UpdatePosition() {
    var dead;
    dead = CheckCollisions();
    board[pacman_position.i][pacman_position.j] = 0;
    var x = GetKeyPressed();
    if (x == Direction.UP) {//Up
        if (pacman_position.j > 0 && board[pacman_position.i][pacman_position.j - 1] != GameItems.OBSTACLE) {//Check if not obstacle or out the boarder
            pacman_position.j--;
            direction = DrawPacmanUp;
        }
    }
    if (x == Direction.DOWN) {//Down
        if (pacman_position.j < (board_height - 1) && board[pacman_position.i][pacman_position.j + 1] != GameItems.OBSTACLE) {
            pacman_position.j++;
            direction = DrawPacmanDown;
        }
    }
    if (x == Direction.LEFT) {//Left
        if (pacman_position.i > 0 && board[pacman_position.i - 1][pacman_position.j] != GameItems.OBSTACLE) {
            pacman_position.i--;
            direction = DrawPacmanLeft;
        }
    }
    if (x == Direction.RIGHT) {//Right
        if (pacman_position.i < (board_width - 1) && board[pacman_position.i + 1][pacman_position.j] != GameItems.OBSTACLE) {
            pacman_position.i++;
            direction = DrawPacmanRight;
        }
    }
    if (board[pacman_position.i][pacman_position.j] == GameItems.RED_FOOD) { //pacman eat food
        score += 5;
        remain_food--;
    }
    board[pacman_position.i][pacman_position.j] = GameItems.PACMAN; // put pacman
    dead = CheckCollisions();
    if (!dead) {
        $.each(ghosts, function (i, ghost) {
            ghost.NextMove();
        });
    }
    else {
        GhostEatsPacman();
    }
    movingScore.NextMove();

    var currentTime = new Date();
    time_elapsed -= (currentTime - start_time) / 1000;
    start_time = currentTime;
    if(time_elapsed <= 0)
        GameOver();
    if (score >= 20 && time_elapsed <= 10) {//Change pacman image to green if you play well
        pac_color = "green";
    }
    if (score >= 200 || remain_food == 0) {//game ended
        window.alert("Game completed");
        window.clearInterval(interval);
        Draw();
        // return;
    }
    else {
        Draw();
    }
}

function MovingScore(x, y, image) {
    var imageObj = new Image();
    imageObj.src = image;
    this.image = imageObj;
    this.x = x;
    this.y = y;
    this.alive = true;
    this.NextMove = function () {
        var randomNum = Math.floor((Math.random() * 4) + 1);
        if (randomNum == Direction.UP) {//Up
            if (this.y > 0 && board[this.x][this.y - 1] != GameItems.OBSTACLE) {//Check if not obstacle or out the boarder
                this.y--;
            }
        }
        if (randomNum == Direction.DOWN) {//Down
            if (this.y < (board_height - 1) && board[this.x][this.y + 1] != GameItems.OBSTACLE) {
                this.y++;
            }
        }
        if (randomNum == Direction.LEFT) {//Left
            if (this.x > 0 && board[this.x - 1][this.y] != GameItems.OBSTACLE) {
                this.x--;
            }
        }
        if (randomNum == Direction.RIGHT) {//Right
            if (this.x < (board_width - 1) && board[this.x + 1][this.y] != GameItems.OBSTACLE) {
                this.x++;
            }
        }
    }
}

function Ghost(x, y, image) {
    var imageObj = new Image();
    imageObj.src = image;
    this.image = imageObj;
    this.x = x;
    this.y = y;
    this.track = new Array();
    this.moved = false;
    this.CalcTrack = function () {
        this.track = BFS(new Node(this.x, this.y));
    }

    this.NextMove = function () {
        if (!this.moved) {
            this.moved = true;
            if (this.track.length > 0) {
                var pos = this.track.pop();
                this.x = pos.x;
                this.y = pos.y;
            }
            else {
                this.CalcTrack();
            }

        }
        else {
            this.moved = false;
        }
    }
}

function Node(x, y, pre) {
    this.x = x;
    this.y = y;
    this.preNode = pre;
}

function BFS(Start) {
    var graph = $.extend(true, [], board);
    graph[pacman_position.i][pacman_position.j] = GameItems.PACMAN;
    var stack = new Array();
    stack.unshift(Start);
    while (stack.length > 0) {
        var node = stack.pop();
        if (board[node.x][node.y] == GameItems.PACMAN) {
            var track = new Array();
            while (node.preNode != null) {
                track.push(node);
                node = node.preNode
            }
            return track;
        }
        var childrens = Expand(node, graph);
        jQuery.each(childrens, function (i, child) {
            // graph[child.x][child.y] = -1;
            stack.unshift(child);
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

    if (node.y < (board_height - 1) && graph[node.x][node.y + 1] != GameItems.OBSTACLE && graph[node.x][node.y + 1] != -1) {
        children.push(new Node(node.x, node.y + 1, node));
        graph[node.x][node.y + 1] = -1;
    }

    if (node.x > 0 && graph[node.x - 1][node.y] != GameItems.OBSTACLE && graph[node.x - 1][node.y] != -1) {
        children.push(new Node(node.x - 1, node.y, node));
        graph[node.x - 1][node.y] = -1;
    }

    if (node.x < (board_width - 1) && graph[node.x + 1][node.y] != GameItems.OBSTACLE && graph[node.x + 1][node.y] != -1) {
        children.push(new Node(node.x + 1, node.y, node));
        graph[node.x + 1][node.y] = -1;
    }
    return children;
}

function showSection(section) {
    window.clearInterval(interval);
    var section1 = document.getElementById('welcome');
    section1.style.visibility = "hidden";
    var section2 = document.getElementById('register');
    section2.style.visibility = "hidden";
    var section3 = document.getElementById('login');
    section3.style.visibility = "hidden";
    var section4 = document.getElementById('gameBoard');
    section4.style.visibility = "hidden";
    var section1 = document.getElementById('settings');
    section1.style.visibility = "hidden";

    //show only one section
    var selected = document.getElementById(section);
    selected.style.visibility = "visible";

}

function showAboutDialog() {
    window.clearInterval(interval);
    document.getElementById("aboutWindow").showModal();
}

function closeAboutDialog() {
    document.getElementById("aboutWindow").close();
    start_time = new Date();
    interval = setInterval(UpdatePosition, loop_iterval);
}

var users = {};
users['a'] = 'a';

function Register() {
    var username = document.getElementById("usernameR").value;
    var password = document.getElementById("passwordR").value;
    users[username] = password;
    showSection("welcome");
}

function LoginValidate() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if (username in users && users[username] === password) {
        currentUser = username;
        alert("found in users");
        showSection('settings');
        return false;
    }

    else{
        alert("Login failed");
        return false;
    }
}

$(document).ready(function () {
    showSection('welcome');
});

// $("#register").submit(function( event ) {
//
// });

// $("#registerForm").validate({
//     rules: {
//         usernameR: "required",
//         // email: {
//         //     required: true,
//         //     email: true
//         // }
//     }
// });