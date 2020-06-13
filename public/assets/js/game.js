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

// Showing game if number of users is two
const showGame = (onlineUsers) => {
    if (onlineUsers.length === 2) {
        console.log('Going to game, two players!');

        waitingEl.classList.add('hide');
        gamePageEl.classList.remove('hide');
    } else {
        console.log('No one to play against..');
        return;
    }
}

// Game over because a player left the game
const gameOverBecausePlayerLeft = (username) => {
    gamePageEl.classList.add('hide');

    document.querySelector('#player-disconnected').classList.remove('hide');
}

// Register new user from startpage
usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    username = document.querySelector('#username').value;
    
    socket.emit('register-user', username, (status) => {
        console.log('Server acknowleged the registration', status);
        
        startEl.classList.add('hide');
        waitingEl.classList.remove('hide');

        if (status.joinGame) {
            showGame(status.onlineUsers);
            updateOnlineUsers(status.onlineUsers)
        };

    });
});


// Sockets
socket.on('reconnect', () => {
    if (username) {
        socket.emit('register-user', username, () => {
            console.log('The server acknowledged our reconnect.')
        })
    }
})

socket.on('online-users', (users) => {
    showGame(users);
    updateOnlineUsers(users);
});

socket.on('new-user-connected', username  => {
    console.log(username + 'connected to the chat');
});

socket.on('user-disconnected', (username) => {
    console.log(username + ' left the chat');
    gameOverBecausePlayerLeft(username);
});

// socket.on('two-players-connected', updateWaitingRoom);