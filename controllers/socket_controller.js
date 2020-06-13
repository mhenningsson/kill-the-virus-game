/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus-game:socket_controller');
let users = {};
const games = {};
let io = null;

// Create game room
// function createGame(player1, player2) {
//     console.log('creating game')

// };

// Get username of online users
function getOnlineUsers() {
    return Object.values(users);
};

// Handle register a new user
function handleRegisterUser(username, callback) {
    debug('User connected to game: ', username);

    users[this.id] = username;
    callback({
        joinGame: true,
        onlineUsers: getOnlineUsers()
    });

    this.broadcast.emit('new-user-connected', username);
    this.broadcast.emit('online-users', getOnlineUsers());
};

// User disconnecting
// function handleUserDisconnect() {
//     debug(users[this.id] + 'left the chat');
//     if (users[this.id]) {
//         this.broadcast.emit('user-disconnected', users[this.id]);
//     }

//     delete users[this.id];
// };

module.exports = function(socket) {
    debug('A client connected: ', socket.id);

    // socket.on('disconnect', handleUserDisconnect);

    socket.on('register-user', handleRegisterUser);

    socket.on('new-user-connected', (username) => {
        debug(username + ' connected to game')
    });

    // socket.on('start-game', createGame)
};