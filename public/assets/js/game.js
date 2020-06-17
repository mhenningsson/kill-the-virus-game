/**
 * Game JavaScript
 */
const socket = io();

// HTML elements
const usernameForm = document.querySelector('#username-form');
const startEl = document.querySelector('#start');
const gamePageEl = document.querySelector('#game-page');
const gameBoard = document.querySelector('#game');
const gameOverResultEl = document.querySelector('#game-over-result');
const waitingEl = document.querySelector('#waiting-room');
const virusImg = document.querySelector('#virus');
const playAgainBtn = document.querySelector('#play-again');
const playAgainDisconnectedBtn = document.querySelector('#play-again-disconnected');
const playerDiconnectedEl = document.querySelector('#player-disconnected');

let username = null;
let timer = null;
let reactiontime = null;
let playersInfo = {
    id: null,
    reactiontime
};
let scoreboard = {};

// Update score board
const updateScoreBoard = (scoreboard, rounds) => {
    document.querySelector('#score-result').innerHTML = Object.entries(scoreboard).map(([key, value]) => {
        return `<li class="list-item players">${key}: ${value}</li>`
    }).join('');

    document.querySelector('#played-rounds').innerText = `Rounds: ${rounds} of 10`;
};

// Showing game if number of users is two
const showGamePage = () => {
    waitingEl.classList.add('hide');
    gamePageEl.classList.remove('hide');
}

// Showing game over and final result
function showGameOver(scoreboard, winner) {
    // Show final score between players
    document.querySelector('#final-result').innerHTML = Object.entries(scoreboard).map(([key, value]) => {
        return `<li class="list-item users">${key}: ${value}</li>`
    }).join('');

    // Show winner or if it's a tie
    console.log('Winner: ', winner, winner.length);
    if (winner.length > 1) {
        document.querySelector('#winner').innerText = winner.map(player => {
            return `${player}`
        }).join(' & ');
    } else {
        document.querySelector('#winner').innerText = `${winner[0]}`
    }

    // Show game over page
    gamePageEl.classList.add('hide');
    gameOverResultEl.classList.remove('hide');
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
    virusImg.style.top = y + "px";
    virusImg.style.left = x + "px";

    setTimeout(() => {
        virusImg.classList.remove('hide'),
        timer = Date.now();
    }, delay);
};

// Game over because a player left the game
const gameOverPlayerDisconnected = () => {
    gamePageEl.classList.add('hide');
    playerDiconnectedEl.classList.remove('hide');
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
        startEl.classList.add('hide');
        waitingEl.classList.remove('hide');

        if (status.joinGame) {
            updateOnlineUsers(status.onlineUsers)
        };

    });
});

// Restart the game when game has been played
playAgainBtn.addEventListener('click', (e) => {
    e.preventDefault();

    gameOverResultEl.classList.add('hide');
    startEl.classList.remove('hide');
})

// Restart the game when other user disconnected
playAgainDisconnectedBtn.addEventListener('click', (e) => {
    e.preventDefault();

    playerDiconnectedEl.classList.add('hide');
    startEl.classList.remove('hide');
})

// Too many players in the room
function tooManyPlayers() {
    startEl.classList.add('hide');
    waitingEl.classList.add('hide');
    document.querySelector('#too-many-players').classList.remove('hide');
}

/**
 * Sockets for user registration and diconnection
 */
socket.on('online-users', (users) => {
    // updateOnlineUsers(users);
});
socket.on('new-user-connected', username  => {
    console.log(username + 'connected to the chat');
});
socket.on('user-disconnected', (username) => {
    gameOverPlayerDisconnected(username);
});

socket.on('too-many-players', tooManyPlayers);


/**
 * Sockets for game code
 */
socket.on('create-game-page', showGamePage);

socket.on('get-available-space', getAvailableSpace);

socket.on('load-image-position', outputRandomImagePosition);

socket.on('update-score-board', updateScoreBoard);

socket.on('game-over', showGameOver);