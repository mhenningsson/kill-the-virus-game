/**
 * Game JavaScript
 */

const socket = io();

// HTML elements
const usernameForm = document.querySelector('#username-form');
const startEl = document.querySelector('#start');
const gamePageEl = document.querySelector('#game-page');

let username = null;


// Update online users
const updateOnlineUsers = (users) => {
    document.querySelector('#online').innerHTML = users.map(user => `<li class="list-item users">${user}</li>`).join('');
}

// Register new user from startpage
usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    username = document.querySelector('#username').value;
    socket.emit('register-user', username, (status) => {
        console.log('Server acknowleged the registration', status);
        updateOnlineUsers(status.onlineUsers);
    });

    startEl.classList.add('hide');
    gamePageEl.classList.remove('hide');

});

socket.on('online-users', (users) => {
    updateOnlineUsers(users);
});

socket.on('new-user-connecte', (username) => {
    console.log(username + 'connected to the chat');
});

socket.on('user-disconnect', (username) => {
    console.log(username + 'left the chat');
})