/**
 * Game JavaScript
 */

const socket = io();

// HTML elements
const usernameForm = document.querySelector('#username-form');
const startEl = document.querySelector('#start');
const gamePageEl = document.querySelector('#game-page');
const gameBoard = document.querySelector('#game');
const gameOverResult = document.querySelector('#game-over-result');
const waitingEl = document.querySelector('#waiting-room');
const virusImg = document.querySelector('#virus');

let username = null;
let timer = null;
let reactiontime = null;
let playersInfo = {
    id: null,
    reactiontime
};
let scoreboard = {};

// Update online users
const updateOnlineUsers = (users, score) => {
    // document.querySelector('#online').innerHTML = users.map(user => `<li class="list-item users">${user}</li>`).join('');
    console.log('Updating users')
};

// Update score board
const updateScoreBoard = (scoreboard) => {
    document.querySelector('#score-result').innerHTML = Object.entries(scoreboard).map(([key, value]) => {
        console.log(`${key}: ${value}`)
        return `<li class="list-item users">${key}: ${value}</li>`
    }).join('');
};

// Showing game if number of users is two
const showGamePage = () => {
    waitingEl.classList.add('hide');
    gamePageEl.classList.remove('hide');
}

// Showing game over and final result
function showGameOver(scoreboard) {
    document.querySelector('#final-result').innerHTML = Object.entries(scoreboard).map(([key, value]) => {
        console.log(`${key}: ${value}`)
        return `<li class="list-item users">${key}: ${value}</li>`
    }).join('');

    gamePageEl.classList.add('hide');
    gameOverResult.classList.remove('hide');
}

// Loading space for virus to position on
function getAvailableSpace(id) {
    const boxHeight = gameBoard.clientHeight;
    const boxWidth = gameBoard.clientWidth;
    
    const y = boxHeight-64;
    const x = boxWidth-64;

    const availableSpace = {y, x};

    socket.emit('create-random-position-for-virus', availableSpace);
}

// Randomly position image
const outputRandomImagePosition = (y, x, delay, user) => {
    console.log('Random numbers from user: ', y, x, user);
    
    virusImg.style.top = y + "px";
    virusImg.style.left = x + "px";

    setTimeout(() => {
        virusImg.classList.remove('hide'),
        timer = Date.now();
    }, delay);
};

// Game over because a player left the game
const gameOverBecausePlayerLeft = (username) => {
    gamePageEl.classList.add('hide');

    document.querySelector('#player-disconnected').classList.remove('hide');
}

// Listen to click on game
virusImg.addEventListener('click', (e) => {
    let clickedTime = Date.now();
    reactiontime = clickedTime - timer;

    let playersInfo = {
        id: socket.id,
        reactiontime,
    }

    socket.emit('clicked-virus', playersInfo);
    virusImg.classList.add('hide');
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
socket.on('update-score-board', updateScoreBoard);
socket.on('game-over', showGameOver);