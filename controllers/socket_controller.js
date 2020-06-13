/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus-game:socket_controller');
let users = {};
let io = null;
const score = null;
const reaction = null;
const timer = null;

// Get username of online users
function getOnlineUsers() {
    return Object.values(users);
};

// Create game
function createGame() {
    console.log('creating one game')
    document.querySelector()
}

// Create random virus position
function createVirusPosition(availableSpace) {
    const y = Math.floor(Math.random() * availableSpace.y);
    const x = Math.floor(Math.random() * availableSpace.x);

    // const delay = Math.floor(Math.random() * 10000);

    io.emit('load-image-position', y, x);
}

// Check if two players are online
function checkUsersOnline(socket) {
    console.log(Object.keys(users).length);

    if (Object.keys(users).length === 2) {
        io.emit('create-game-page');
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

    socket.on('disconnect', handleUserDisconnect);

    socket.on('register-user', handleRegisterUser);

    socket.on('new-user-connected', (username) => {
        debug(username + ' connected to game')
    });

    socket.on('create-random-position-for-virus', createVirusPosition);
};