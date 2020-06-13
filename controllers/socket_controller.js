/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus-game:socket_controller');
let users = {};
let io = null;
let score = null;
let reaction = {};
let timer = null;
let playedRounds = 0;

// Get username of online users
function getOnlineUsers() {
    return Object.values(users);
};

// Start new game
function startNewGame(socket) {
    console.log('creating one game from user: ', users[socket.id]);

        socket.emit('get-available-space', socket.id);
        timer = Date.now()
    
};

// Create random virus position
function createVirusPosition(availableSpace) {
    const y = Math.floor(Math.random() * availableSpace.y);
    const x = Math.floor(Math.random() * availableSpace.x);
    const delay = Math.floor(Math.random() * 10000);

    io.emit('load-image-position', y, x, delay, users[this.id]);
};


// Get what time a player clicked the virus
function getClickTime(user, time) {
    console.log(user + ' clicked the virus on: ' + time);
    console.log(users[this.id]);

    let reactiontime = time - timer;

    reaction[this.id] = reactiontime;
    console.log('reaction : ', reactiontime)
    console.log('reaction id: ', reaction)

    compareReactionTimes();
};

function compareReactionTimes() {
    console.log(Object.keys(reaction).length)
}



// Check if two players are online
function checkUsersOnline(socket) {
    if (Object.keys(users).length === 2) {
        io.emit('create-game-page');
        
        console.log(users[socket.id] + ' started the game');

        startNewGame(socket);
    } else {
        return;
    }
}

// Handle register a new user
function handleRegisterUser(username, callback) {
    debug('User connected to game: ', username);

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
    debug(users[this.id] + 'left the chat');
    if (users[this.id]) {
        this.broadcast.emit('user-disconnected', users[this.id]);
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