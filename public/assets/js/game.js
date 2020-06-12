/**
 * Game JavaScript
 */

const socket = io();

// HTML elements
const usernameForm = document.querySelector('#username-form');
const startEl = document.querySelector('#start');
const gamePageEl = document.querySelector('#game-page');
const waitingEl = document.querySelector('#waiting-room');

let username = null;

// Update online users
const updateOnlineUsers = (users) => {
    document.querySelector('#online').innerHTML = users.map(user => `<li class="list-item users">${user}</li>`).join('');
};

// Waiting room
const updateWaitingRoom = (users) => {
    if (users.length > 1) {
        console.log('Yay were more than one!')

        waitingEl.classList.add('hide');
        gamePageEl.classList.remove('hide');

        // loadGame()
        // socket.emit('game-ready', users)
    } else {
        console.log('im so lonely');
        return;
    }
}

// Register new user from startpage
usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    username = document.querySelector('#username').value;
    socket.emit('register-user', username, (status) => {
        console.log('Server acknowleged the registration', status);

        updateOnlineUsers(status.onlineUsers);

        updateWaitingRoom(status.onlineUsers);
    });

    startEl.classList.add('hide');
    waitingEl.classList.remove('hide');
});


// Sockets
socket.on('online-users', (users) => {
    updateOnlineUsers(users);
    updateWaitingRoom(users);
});

socket.on('new-user-connected', username  => {
    console.log(username + 'connected to the chat');
});

socket.on('user-disconnected', (username) => {
    console.log(username + ' left the chat');
})