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
const showGamePage = () => {
    waitingEl.classList.add('hide');
    gamePageEl.classList.remove('hide');

    // getAvailableSpace();
}

// Loading space for virus to position on
function getAvailableSpace(id) {
    console.log('getting available space for id: ', id)
    const boxHeight = document.querySelector('#game').clientHeight;
    const boxWidth = document.querySelector('#game').clientWidth;
    
    const y = boxHeight-64;
    const x = boxWidth-64;

    const availableSpace = {y, x};

    socket.emit('create-random-position-for-virus', availableSpace);
}

// Randomly position image
const outputRandomImagePosition = (y, x, delay, user, timer) => {
    console.log('Random numbers from user: ', y, x, user);
    
    document.querySelector('#virus').style.top = y + "px";
    document.querySelector('#virus').style.left = x + "px";

    setTimeout(function() {
        document.querySelector('#virus').classList.remove('hide');
    }, delay);

    console.log('New image position with delay: ', delay)
};

// Game over because a player left the game
const gameOverBecausePlayerLeft = (username) => {
    gamePageEl.classList.add('hide');

    document.querySelector('#player-disconnected').classList.remove('hide');
}

// Listen to click on game
document.querySelector('#virus').addEventListener('click', (e) => {
    console.log('Click!');

    document.querySelector('#virus').classList.add('hide');
    socket.emit('clicked-virus', [socket.id], Date.now());
})


// Register new user from startpage
usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    username = document.querySelector('#username').value;
    
    socket.emit('register-user', username, (status) => {
        console.log('Server acknowleged the registration', status);
        
        startEl.classList.add('hide');
        waitingEl.classList.remove('hide');

        if (status.joinGame) {
            updateOnlineUsers(status.onlineUsers)
        };

    });
});


/**
 * Sockets for user registration and diconnection
 */
socket.on('reconnect', () => {
    if (username) {
        socket.emit('register-user', username, () => {
            console.log('The server acknowledged our reconnect.')
        })
    }
})
socket.on('online-users', (users) => {
    updateOnlineUsers(users);
});
socket.on('new-user-connected', username  => {
    console.log(username + 'connected to the chat');
});
socket.on('user-disconnected', (username) => {
    console.log(username + ' left the chat');
    gameOverBecausePlayerLeft(username);
});


/**
 * Sockets for game code
 */
socket.on('create-game-page', showGamePage);
socket.on('get-available-space', getAvailableSpace)
socket.on('load-image-position', outputRandomImagePosition);