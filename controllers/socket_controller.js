/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus-game:socket_controller');
const users = {};

// Get username of online users
function getOnlineUsers() {
    return Object.values(users);
}

// Handle register a new user
function handleRegisterUser(username, callback) {
    debug('User connected to game: ', username);
    users[this.id] = username;

    callback({
        onlineUsers: getOnlineUsers()
    });

    this.broadcast.emit('new-user-connected', username);

    this.broadcast.emit('online-users', getOnlineUsers());
}

module.exports = function(socket) {
    debug('A client connected: ', socket.id);

    socket.on('disconnect', () => {
        debug('A client disconnected: ', socket.id);
    })

    socket.on('register-user', handleRegisterUser);
;}