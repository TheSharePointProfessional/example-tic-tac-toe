// -----------------------------------------------------------------------------
// Util
// -----------------------------------------------------------------------------

function byId (id) {
  return document.getElementById(id)
}

// function deepCopy (x) {
//   return JSON.parse(JSON.stringify(x))
// }

// -----------------------------------------------------------------------------
// Game State + Logic
// -----------------------------------------------------------------------------

function checkCoords (board, player, coords) {
  return (player + player + player) === (board[coords[0]] + board[coords[1]] + board[coords[2]])
}

const winningCoords = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
]

// returns a win object with player + coords
// or returns the string 'tie'
// or null if the game is not over
function checkWinner (board) {
  // check for winning conditions
  for (let i = 0; i < winningCoords.length; i++) {
    if (checkCoords(board, 'O', winningCoords[i])) {
      return {
        coords: winningCoords[i],
        player: 'O'
      }
    } else if (checkCoords(board, 'X', winningCoords[i])) {
      return {
        coords: winningCoords[i],
        player: 'X'
      }
    }
  }

  // check for a tie
  if (board.join('').length === 9) {
    return 'tie'
  }

  return null
}

// returns an initial game state
function newGameState (initialPlayer) {
  // pick a random side to start if no initial value is passed in
  if (!isValidPlayer(initialPlayer)) {
    initialPlayer = Math.random() >= 0.5 ? 'X' : 'O'
  }

  return {
    playerTurn: initialPlayer,
    board: [
      null, null, null,
      null, null, null,
      null, null, null
    ],
    winner: null
  }
}

// "let" indicates that this variable is STATEFUL
// STATEFUL means "changes over time"
let theGame = newGameState()

function resetGame () {
  theGame = newGameState()
  renderGame()
}

function takeTurn (player, boxId) {
  // defensive
  if (theGame.winner) {
    console.error('Cannot take a turn; the game is over.')
    return
  }

  if (theGame.playerTurn !== player) {
    console.error('It is ' + theGame.playerTurn + 's turn to play.')
    return
  }

  if (!isValidBoxId(boxId)) {
    console.error('Invalid boxId passed to takeTurn function: ' + boxId)
    return
  }

  if (theGame.board[boxId] !== null) {
    console.error('boxId ' + boxId + ' already has a piece')
    return
  }

  theGame.board[boxId] = player
  theGame.playerTurn = player === 'X' ? 'O' : 'X'

  // check if there is a winner
  theGame.winner = checkWinner(theGame.board)

  renderGame()
}

// -----------------------------------------------------------------------------
// HTML
// -----------------------------------------------------------------------------

function buildSquare (boxId, contents) {
  if (contents === null) {
    contents = ''
  }
  return `<div class="square ${contents}" id="box${boxId}">${contents}</div>`
}

function buildRow (squares) {
  return '<div class="row">' +
         buildSquare(squares[0].id, squares[0].contents) +
         buildSquare(squares[1].id, squares[1].contents) +
         buildSquare(squares[2].id, squares[2].contents) +
         '</div>'
}

function buildBoard (board) {
  const row1 = [
    {id: 0, contents: board[0]},
    {id: 1, contents: board[1]},
    {id: 2, contents: board[2]}
  ]

  const row2 = [
    {id: 3, contents: board[3]},
    {id: 4, contents: board[4]},
    {id: 5, contents: board[5]}
  ]

  const row3 = [
    {id: 6, contents: board[6]},
    {id: 7, contents: board[7]},
    {id: 8, contents: board[8]}
  ]

  return '<div class="board-container">' +
     '<div class="board">' +
     buildRow(row1) +
     buildRow(row2) +
     buildRow(row3) +
     '</div>' +
     '</div>'
}

function buildPlayerTurn (playerTurn) {
  return `
    <div class="banner-wrapper turn-wrapper">
      <span class="label">Current turn:</span>
      <span class="current-turn ${playerTurn}">${playerTurn}</span>
    </div>`
}

function buildGameOverBanner (msg, alertClass) {
  return `
    <div class="banner-wrapper">
      <div class="alert ${alertClass}" role="alert">
        <h2 class="alert-heading">${msg}</h2>
        <button class="btn btn-primary" id=resetGameBtn>New Game</button>
      </div>
    </div>`
}

function buildGame (game) {
  let html = '<h1 class="display-3">Tic Tac Toe</h1>'

  if (game.winner === 'tie') {
    html += buildGameOverBanner('Tie game!', 'alert-dark')
  } else if (game.winner && game.winner.player === 'X') {
    html += buildGameOverBanner('X wins!', 'alert-success')
  } else if (game.winner && game.winner.player === 'O') {
    html += buildGameOverBanner('O wins!', 'alert-primary')
  } else {
    html += buildPlayerTurn(game.playerTurn)
  }

  html += buildBoard(game.board)

  return html
}

// -----------------------------------------------------------------------------
// Rendering
// -----------------------------------------------------------------------------

let containerEl = null

let renderCount = 0

// Converts theGame state into HTML and puts it into the DOM
function renderGame () {
  renderCount++
  console.info('Rendering game now - #' + renderCount)
  containerEl.innerHTML = buildGame(theGame)
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

function isValidPlayer (player) {
  return player === 'O' ||
         player === 'X'
}

function isValidBoxId (boxId) {
  return typeof boxId === 'number' &&
         boxId >= 0 &&
         boxId <= 8
}

// -----------------------------------------------------------------------------
// Events
// -----------------------------------------------------------------------------

function clickSquare (boxId) {
  // sanity check that the boxId is valid
  if (!isValidBoxId(boxId)) {
    console.error('Invalid boxId passed to clickSquare function: ' + boxId)
    return
  }

  takeTurn(theGame.playerTurn, boxId)
}

function clickContainer (evt) {
  const targetEl = evt.target
  // defensive
  if (!targetEl) return

  if (targetEl.classList.contains('square')) {
    const elId = targetEl.id
    const idWithoutBoxString = elId.replace('box', '')
    const boxIdNumber = parseInt(idWithoutBoxString, 10)
    clickSquare(boxIdNumber)
  }

  if (targetEl.id === 'resetGameBtn') {
    resetGame()
  }
}

function addEvents () {
  console.info('Adding DOM events')
  containerEl.addEventListener('click', clickContainer)
}

// -----------------------------------------------------------------------------
// Init
// -----------------------------------------------------------------------------

function init () {
  console.info('Initializing tic-tac-toe!')
  containerEl = byId('container')
  addEvents()
  renderGame()
}

document.addEventListener('DOMContentLoaded', init)
