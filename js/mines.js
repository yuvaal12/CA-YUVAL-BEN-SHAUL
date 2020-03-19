'use strict';
// global   ----------------------
const MINE = '🧨'
const FLAG = '🚩';
var gBoard = [];
var gCntNigh = 0;
var gInterval;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    startTime: 0
}
var gIsHint = false;
var gFlagsMarked = document.querySelector('.marked-flags');
gFlagsMarked.innerText = gGame.markedCount;
var gMines = document.querySelector('.mines-mode');
gMines.innerText = gLevel.MINES;
var gElMsg = document.querySelector('.msg');
var gLives = 3;
var gElLives = document.querySelectorAll('.lives')
var gAudioBomb = new Audio('audio/bomb.mp3');
var gAudioglass = new Audio('audio/glass.mp3');

// on load  ----------------------
function init() {
    gBoard = play();
    renderBoard(gBoard);
}

function play() {
    var board = [];
    board = createBoard(board);
    board = mineCnt(board);
    return board;
}

// mode  ----------------------
function easyMode() {
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    gMines.innerText = gLevel.MINES;
    restartMode()
}

function midMode() {
    gLevel.SIZE = 8;
    gLevel.MINES = 12;
    gMines.innerText = gLevel.MINES;
    restartMode()
}

function hardMode() {
    gLevel.SIZE = 12;
    gLevel.MINES = 30;
    gMines.innerText = gLevel.MINES;
    restartMode()
}

// smile Button  ----------------------
function startNewGame() {
    if (gLevel.SIZE === 12) {
        hardMode();
        console.log('hard');

    } else if (gLevel.SIZE === 8) {
        midMode();
        console.log('mid');
    } else if (gLevel.SIZE === 4) {
        easyMode();
        console.log('easy');
    }
}
// restart   ----------------------
function restartMode() {
    document.querySelector('.smile-btn').innerText = '😁';
    gElMsg.classList.add('hideItems');
    gFlagsMarked.innerText = gGame.markedCount;
    gGame.markedCount = 0;
    clearInterval(gInterval);
    gInterval = null;
    gGame.startTime = 0;
    gLives = 3;
    for (var i = 0; i < gElLives.length; i++) {
        gElLives[i].classList.remove('hideItems');
    }
    gIsHint = false;
    var elHints = document.querySelectorAll('.hints')
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].classList.remove('hideItems')
    }
    init()
}


// create the board  ----------------------
function createBoard(board) {

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            };
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        makeMines(board);
    }
    // console.log(board);
    return board;
}

// render the board to html  ----------------------
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var strData = `data-i="${i}" data-j="${j}"`;
            strHTML += `<td>
            <div class="open-cell hideItems"  ${strData}">${board[i][j].minesAroundCount}</div>
            <div id="${i}-${j}" oncontextmenu="setFlag(this, ${i}, ${j})" 
            class="close-cell"onclick="cellClicked(this, ${i}, ${j})"></div>`;
            strHTML += '</td>';
        }
        strHTML += '</tr>'
    }
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
    setColorNums(board)
}

// set / remove flag in right click  ----------------------
function setFlag(elFlag, i, j) {

    if (elFlag.innerText !== FLAG) {
        elFlag.innerText = FLAG;
        gFlagsMarked.innerText++;
        gGame.markedCount += 1;
        gBoard[i][j].isMarked = true;

    } else {
        elFlag.innerText = '';
        gFlagsMarked.innerText--;
        gGame.markedCount -= 1;
        gBoard[i][j].isMarked = false;
    }
    isVictory()
    window.event.returnValue = false;
}

// cell clicked   ----------------------
function cellClicked(elCellClose, row, col) {
    if (gBoard[row][col].minesAroundCount === MINE) {
        gAudioBomb.play();
    } else {
        gAudioglass.play();
    }

    if (gIsHint) {
        gBoard[row][col].isShown = false;
        openHints(row, col);
    } else {
        gBoard[row][col].isShown = true;
    }

    elCellClose.classList.add('hideItems');
    var elCellOpen = document.querySelector(`[data-i="${row}"][data-j="${col}"]`);
    elCellOpen.classList.remove('hideItems');

    if (gGame.startTime == 0) {
        gGame.startTime = Date.now()
        gInterval = setInterval(setTime, 1000);
    }
    if (gBoard[row][col].minesAroundCount === MINE && gIsHint === false) {
        gBoard[row][col].isShown === true;
        gLives--;
        gLevel.MINES--;
        gElLives[gLives].classList.add('hideItems');
        if (gLives === 0) {
            document.querySelector('.smile-btn').innerText = '🥵';
            gameOver(elCellOpen);
        }
    }
    if (gBoard[row][col].minesAroundCount == 0) {
        openNeigCelles(row, col, gBoard);
    }
    isVictory()
}

// open the neighbors around the 0 cell  ----------------------
function openNeigCelles(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].minesAroundCount !== MINE && !board[i][j].isShown) {
                board[i][j].isShown = true;
                document.querySelector(`[data-i="${i}"][data-j="${j}"]`).classList.remove('hideItems');
                document.getElementById(`${i}-${j}`).classList.add('hideItems');
                if (board[i][j].minesAroundCount === 0) {
                    openNeigCelles(i, j, board)
                }

            }
        }
    }
}

// find empty cells in the board add them to arr ----------------------
function findEmptyCells(board) {
    var optenalCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].minesAroundCount === 0) {
                optenalCells.push({ i, j })
            }
        }
    }
    return optenalCells;
}

// place random mines in the board (in the empty cells) ----------------------
function makeMines(board) {
    var emptyCells = findEmptyCells(board);
    var rndCell = getRandomInteger(0, emptyCells.length - 1);
    var mineLocation = emptyCells.splice(rndCell, 1);
    board[mineLocation[0].i][mineLocation[0].j].minesAroundCount = MINE;
    board[mineLocation[0].i][mineLocation[0].j].isMine = true;
}

// look for mines in the board and call countNeighbors ----------------------
function mineCnt(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].minesAroundCount !== MINE) countNeighbors(i, j, board);
        }
    }
    return board;
}

//count the neighbors around the mine add them +1 ----------------------
function countNeighbors(row, col, board) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === row && j === col) continue;
            if (board[i][j].minesAroundCount === MINE) {
                board[row][col].minesAroundCount++;
            }
        }
    }
}

// rndom number nim max ----------------------
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// timer start ----------------------
function setTime() {
    var miliSeconds = document.getElementById("miliSeconds");
    var end = Date.now() - gGame.startTime;
    miliSeconds.innerText = Math.floor(end / 1000);
}

// game over  ----------------------
function gameOver(elMineLocation) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine == true) {
                document.querySelector(`[data-i="${i}"][data-j="${j}"]`).classList.remove('hideItems');
                document.getElementById(`${i}-${j}`).classList.add('hideItems');
                gGame.isOn = false;
                gElMsg.innerText = 'Game Over !';
                clearInterval(gInterval);
                gElMsg.classList.remove('hideItems');

            }
        }
    }
    elMineLocation.classList.add('showMine');
}

// Victory  ----------------------
function isVictory() {
    var openCells = cntFliiped();
    if (openCells === (gLevel.SIZE ** 2) - gLevel.MINES &&
        (gGame.markedCount == gLevel.MINES)) {
        gElMsg.classList.remove('hideItems');
        gElMsg.innerText = 'Victory';
        clearInterval(gInterval);
        document.querySelector('.smile-btn').innerText = '🤩';
        return true;
    }
    return false
}

// count cell is flipped  ----------------------
function cntFliiped() {
    var cnt = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            // if (!gBoard[i][j].isMine) {
            if (gBoard[i][j].isShown) {
                cnt++;
            }
            // }
        }
    }
    return cnt;
}

// open when hints clicked  ----------------------
function openHints(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            document.querySelector(`[data-i="${i}"][data-j="${j}"]`).classList.remove('hideItems');
            document.getElementById(`${i}-${j}`).classList.add('hideItems');
        }
    }
    setTimeout(closeHints, 1000, row, col);
}

//close hints ----------------------
function closeHints(row, col) {
    gIsHint = false;
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (!gBoard[i][j].isShown) {
                document.querySelector(`[data-i="${i}"][data-j="${j}"]`).classList.add('hideItems');
                document.getElementById(`${i}-${j}`).classList.remove('hideItems');
            }
        }
    }
}

function hintsDisplay(elHint) {
    elHint.classList.add('hideItems')
    gIsHint = true;
}

//set counter color ----------------------

function setColorNums(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var elColor = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            switch (board[i][j].minesAroundCount) {
                case 0:
                    elColor.style.color = 'rgb(78, 20, 117)';
                    break;
                case 1:
                    elColor.style.color = '#6600ff';
                    break;
                case 2:
                    elColor.style.color = '#ff0066';
                    break;
                case 3:
                    elColor.style.color = '#ffff33';
                    break;
                case 4:
                    elColor.style.color = '#66ff66';
                    break;
                case 5:
                    elColor.style.color = '#ff9900';
                    break;
                case 6:
                    elColor.style.color = '#000080';
                    break;
                case 7:
                    elColor.style.color = '#000000';
                    break;
                case 8:
                    elColor.style.color = '#ffffff';
                    break;
            }
        }
    }
}
