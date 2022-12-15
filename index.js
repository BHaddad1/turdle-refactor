// Global Variables
var winningWord = "";
var currentRow = 1;
var guess = "";
var gamesPlayed = [];
var wordsTwo;

// Query Selectors
var inputs = document.querySelectorAll("input");
var guessButton = document.querySelector("#guess-button");
var keyLetters = document.querySelectorAll("span");
var errorMessage = document.querySelector("#error-message");
var viewRulesButton = document.querySelector("#rules-button");
var viewGameButton = document.querySelector("#play-button");
var viewStatsButton = document.querySelector("#stats-button");
var gameBoard = document.querySelector("#game-section");
var letterKey = document.querySelector("#key-section");
var rules = document.querySelector("#rules-section");
var stats = document.querySelector("#stats-section");
var gameOverBox = document.querySelector("#game-over-section");
var gameOverGuessCount = document.querySelector("#game-over-guesses-count");
var gameOverGuessGrammar = document.querySelector("#game-over-guesses-plural");
const gameOverTextHeadLine = document.querySelector("informational-text");
const statsSection = document.getElementById("stats-section");
var firstLastCell = document.getElementById("cell-6-25");
var secondLastCell = document.getElementById("cell-6-26");
var thirdLastCell = document.getElementById("cell-6-27");
var fourthLastCell = document.getElementById("cell-6-28");
var fifthLastCell = document.getElementById("cell-6-29");

// Event Listeners

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener("keyup", function () {
    moveToNextInput(event);
  });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener("click", function () {
    clickLetter(event);
  });
}

guessButton.addEventListener("click", submitGuess);

viewRulesButton.addEventListener("click", viewRules);

viewGameButton.addEventListener("click", viewGame);

viewStatsButton.addEventListener("click", viewStats);

// lastCell.addEventListener("keyup", checkForLoss);

// Functions

fetch("http://localhost:3001/api/v1/words")
  .then((response) => response.json())
  .then((data) => {
    wordsTwo = data;
    setGame();
  });

function setGame() {
  currentRow = 1;
  winningWord = getRandomWord();
  updateInputPermissions();
}

function getRandomWord() {
  var randomIndex = Math.floor(Math.random() * 2500);
  return wordsTwo[randomIndex];
}

function updateInputPermissions() {
  for (var i = 0; i < inputs.length; i++) {
    if (!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }

  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;

  if (key !== 8 && key !== 46) {
    var indexOfNext = parseInt(e.target.id.split("-")[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if (
      inputs[i].id.includes(`-${currentRow}-`) &&
      !inputs[i].value &&
      !activeInput
    ) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function checkForLastRow() {
  if (
    firstLastCell.value &&
    secondLastCell.value &&
    thirdLastCell.value &&
    fourthLastCell.value &&
    fifthLastCell.value
  ) {
    return true;
  }
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = "";
    compareGuess();
    if (checkForWin()) {
      setTimeout(function () {
        viewGameOverMessage();
        gameOverBox.innerHTML = `<h3 id="game-over-message">Yay!</h3>
        <p class="informational-text">
          You did it! It took you
          <span id="game-over-guesses-count">${currentRow}</span> guess<span
            id="game-over-guesses-plural"
            >es</span
          >
          to find the correct word.
        </p>`;
        recordGameStats();
        setTimeout(startNewGame, 4000);
      }, 1000);
    } else if (!checkForWin() && checkForLastRow()) {
      errorMessage.innerText = "You didn't guess the correct word";
      setTimeout(function () {
        viewGameOverMessage();
        gameOverBox.innerHTML = `<h3 id="game-over-message">Oh no!</h3>
        <p class="informational-text">
          You lost this round!
        </p>`;
        errorMessage.innerText = "";
        recordGameStats();
        setTimeout(startNewGame, 1000);
      }, 4000);
    } else {
      changeRow();
    }
  } else {
    errorMessage.innerText = "Not a valid word. Try again!";
  }
}

function checkIsWord() {
  guess = "";

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return wordsTwo.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split("");

  for (var i = 0; i < guessLetters.length; i++) {
    if (
      winningWord.includes(guessLetters[i]) &&
      winningWord.split("")[i] !== guessLetters[i]
    ) {
      updateBoxColor(i, "wrong-location");
      updateKeyColor(guessLetters[i], "wrong-location-key");
    } else if (winningWord.split("")[i] === guessLetters[i]) {
      updateBoxColor(i, "correct-location");
      updateKeyColor(guessLetters[i], "correct-location-key");
    } else {
      updateBoxColor(i, "wrong");
      updateKeyColor(guessLetters[i], "wrong-key");
    }
  }
}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  recordGameStats();
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}

function recordGameStats() {
  if (checkForWin()) {
    gamesPlayed.push({ solved: true, guesses: currentRow });
  } else if (!checkForWin() && checkForLastRow()) {
    gamesPlayed.push({ solved: false, guesses: 6 });
  }
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add("collapsed");
  } else {
    gameOverGuessGrammar.classList.remove("collapsed");
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
    inputs[i].classList.remove("correct-location", "wrong-location", "wrong");
  }
}

function clearKey() {
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove(
      "correct-location-key",
      "wrong-location-key",
      "wrong-key"
    );
  }
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add("hidden");
  gameBoard.classList.add("collapsed");
  rules.classList.remove("collapsed");
  stats.classList.add("collapsed");
  viewGameButton.classList.remove("active");
  viewRulesButton.classList.add("active");
  viewStatsButton.classList.remove("active");
}

function viewGame() {
  letterKey.classList.remove("hidden");
  gameBoard.classList.remove("collapsed");
  rules.classList.add("collapsed");
  stats.classList.add("collapsed");
  gameOverBox.classList.add("collapsed");
  viewGameButton.classList.add("active");
  viewRulesButton.classList.remove("active");
  viewStatsButton.classList.remove("active");
}

function viewStats() {
  letterKey.classList.add("hidden");
  gameBoard.classList.add("collapsed");
  rules.classList.add("collapsed");
  stats.classList.remove("collapsed");
  viewGameButton.classList.remove("active");
  viewRulesButton.classList.remove("active");
  viewStatsButton.classList.add("active");
  statsSection.innerHTML = `<h3>GAME STATS</h3>
        <p class="informational-text">
          You've played <span id="stats-total-games">${
            gamesPlayed.length
          }</span> games.
        </p>
        <p class="informational-text">
          You've guessed the correct word
          <span id="stats-percent-correct">${gamesPlayed.reduce((acc, cur) => {
            acc += cur.solved === true;
            return (acc / gamesPlayed.length) * 100;
          }, 0)}</span>% of the time.
        </p>
        <p class="informational-text">
          On average, it takes you
          <span id="stats-average-guesses">${gamesPlayed.reduce((acc, cur) => {
            acc += cur.guesses;
            return acc / gamesPlayed.length;
          }, 0)}</span> guesses to find
          the correct word.
        </p>`;
}

function viewGameOverMessage() {
  gameOverBox.classList.remove("collapsed");
  letterKey.classList.add("hidden");
  gameBoard.classList.add("collapsed");
}
