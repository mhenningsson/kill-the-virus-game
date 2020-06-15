/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus-game:socket_controller');
let users = {};
let io = null;
let otherPlayer = {};

let timesclicked = 0;
let game = {
    players: {},
    playedRounds: 0,
    score: {},
    reaction: {}
};

let scoreboard = {}; 

// Get username of online users
function getOnlineUsers() {
    return Object.values(users);
};

// Start new game
function startNewGame(socket) {
    console.log('creating one game from user: ', users[socket.id]);
        
    if (game.playedRounds < 10) {
        socket.emit('get-available-space', socket.id);
        console.log('Played rounds: ', game.playedRounds)
    } else {
        io.emit('game-over', scoreboard);
        game.playedRounds = 0;
    
        console.log("game over");
        return;
    }

};

function updateScoreBoard(id) {
    scoreboard[game.players[id]] = game.score[id];
    console.log('updating result', scoreboard);

    io.emit('update-score-board', scoreboard);
}

// Create random virus position
function createVirusPosition(availableSpace) {
    const y = Math.floor(Math.random() * availableSpace.y);
    const x = Math.floor(Math.random() * availableSpace.x);

    const delay = Math.floor(Math.random() * 10000);

    io.emit('load-image-position', y, x, delay, users[this.id]);
};

// Get what time a player clicked the virus
function getClickTime(playerInfo) {
    game.reaction[playerInfo.id] = playerInfo.reactiontime;
    timesclicked++;
    compareReactionTimes(this);
};

// Comparing reactiontime and updating score
function compareReactionTimes(socket) {
    if (timesclicked === 2) {
        if (game.reaction[socket.id] < otherPlayer.reaction) {
            game.score[socket.id]++;
            updateScoreBoard(socket.id);
        } else if (game.reaction[socket.id] > otherPlayer.reaction) {
            game.score[otherPlayer.id]++;
            updateScoreBoard(otherPlayer.id);
        }
    } else {
        otherPlayer = {
            id: [socket.id], 
            reaction: game.reaction[socket.id]
        }
        return;
    }
    debug('Score: ', game.score);
    timesclicked = 0;
    game.playedRounds++;

    startNewGame(socket);
};

// Check if two players are online
function checkUsersOnline(socket) {
    if (Object.keys(users).length === 2) {
        game.score[socket.id] = 0;
        scoreboard[game.players[socket.id]] = 0;

        io.emit('update-score-board', scoreboard);
        io.emit('create-game-page');

        startNewGame(socket);
    } else {
        game.score[socket.id] = 0;
        scoreboard[game.players[socket.id]] = 0;
        return;
    }
}

// Handle register a new user
function handleRegisterUser(username, callback) {
    debug('User connected to game: ', username);

    users[this.id] = username;
    game.players[this.id] = username;

    callback({
        joinGame: true,
        onlineUsers: getOnlineUsers()
    });

    checkUsersOnline(this);

    this.broadcast.emit('new-user-connected', username);
    this.broadcast.emit('online-users', getOnlineUsers());
};

// User disconnecting
function handleUserDisconnect() {
    if (game.playedRounds > 0) {
        if (users[this.id]) {
            this.broadcast.emit('user-disconnected', users[this.id]);
        }
    } 

    delete users[this.id];
};


module.exports = function(socket) {
    debug('A client connected: ', socket.id);
    io = this;

    // Sockets for user registration and disconnection
    socket.on('disconnect', handleUserDisconnect);

    socket.on('register-user', handleRegisterUser);

    socket.on('new-user-connected', (username) => {
        debug(username + ' connected to game')
    });

    // Sockets for game code
    socket.on('create-random-position-for-virus', createVirusPosition);

    socket.on('clicked-virus', getClickTime);
};