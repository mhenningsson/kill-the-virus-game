/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus-game:socket_controller');
let io = null;

let users = {};
let otherPlayer = {};
let timesclicked = 0;
let game = {
    players: {},
    playedRounds: 0,
    score: {},
    reaction: {}
};
let scoreboard = {}; 

// Check if two players are online
function checkUsersOnline(socket) {
    if (Object.keys(users).length === 2) {
        game.players[socket.id] = users[socket.id];
        game.score[socket.id] = 0;
        scoreboard[game.players[socket.id]] = 0;

        io.emit('update-score-board', scoreboard, game.playedRounds);
        io.emit('create-game-page');

        startNewGame(socket);
    } else if (Object.keys(users).length < 2) {
        game.players[socket.id] = users[socket.id];
        game.score[socket.id] = 0;
        scoreboard[game.players[socket.id]] = 0;
        return;
    } else if (Object.keys(users).length > 2) {
        delete users[socket.id];
        socket.emit('too-many-players');
    }
};

// Comparing reactiontime and updating score
function compareReactionTimes(socket) {
    if (timesclicked === 2) {
        if (game.reaction[socket.id] < otherPlayer.reaction) {
            game.score[socket.id]++;
            game.playedRounds++;
            updateScoreBoard(socket.id);
        } else if (game.reaction[socket.id] > otherPlayer.reaction) {
            game.score[otherPlayer.id]++;
            game.playedRounds++;
            updateScoreBoard(otherPlayer.id);
        }
    } else {
        otherPlayer = {
            id: [socket.id], 
            reaction: game.reaction[socket.id]
        }
        return;
    }
    timesclicked = 0;
    startNewGame(socket);
};

// Create random virus position
function createVirusPosition(availableSpace) {
    const y = Math.floor(Math.random() * availableSpace.y);
    const x = Math.floor(Math.random() * availableSpace.x);

    const delay = Math.floor(Math.random() * 7000);

    io.emit('load-image-position', y, x, delay, users[this.id]);
};

// Get what time a player clicked the virus
function getClickTime(playerInfo) {
    game.reaction[playerInfo.id] = playerInfo.reactiontime;
    timesclicked++;
    compareReactionTimes(this);
};

// Get username of online users
function getOnlineUsers() {
    return Object.values(users);
};

// Get winner of the game
function getWinner() {
    return Object.entries(scoreboard).reduce((player, [key, value]) => {
        if (value >= 5) {
            player.push(key)
        }
        return player;
    }, []);
;}

// Handle register a new user
function handleRegisterUser(username, callback) {
    users[this.id] = username;

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
    if (game.players[this.id]) {
        if (users[this.id]) {
            this.broadcast.emit('user-disconnected', users[this.id]);
        }
        resettingGame();
    }
    delete users[this.id];
};

// Reset saved info about users and game
const resettingGame = () => {
    users = {};
    game = {
        players: {},
        playedRounds: 0,
        score: {},
        reaction: {}
    }
    scoreboard = {};
};

// Start new game
function startNewGame(socket) {
    if (game.playedRounds < 10) {
        socket.emit('get-available-space', socket.id);
    } else {
        io.emit('game-over', scoreboard, getWinner());
        resettingGame();
        return;
    }

};

// Updating scoreboard for front end
function updateScoreBoard(id) {
    scoreboard[game.players[id]] = game.score[id];
    io.emit('update-score-board', scoreboard, game.playedRounds);
};


module.exports = function(socket) {
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