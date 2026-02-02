const Gameboard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];

  const WinningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const getBoard = () => {
    return board;
  };

  const setMark = (index, mark) => {
    if (index >= 0 && index < 9) {
      board[index] = mark;
      return true;
    }
    return false;
  };

  const reset = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = "";
    }
  };

  const isPositionAvailable = (index) => {
    return board[index] === "";
  };

  const getWinningPatterns = () => {
    return WinningPatterns;
  };

  return {
    getBoard,
    getWinningPatterns,
    setMark,
    reset,
    isPositionAvailable,
  };
})();

const Player = (name, mark) => {
  const getName = () => name;
  const getMark = () => mark;

  return {
    getName,
    getMark,
  };
};

const GameController = (() => {
  let players = [];
  let currentPlayer = 0;
  let gameOver = false;

  const startGame = (player1, player2) => {
    players = [Player(player1, "X"), Player(player2, "O")];
    currentPlayer = 0;
    gameOver = false;
    Gameboard.reset();
    console.log(
      `Game started! ${players[0].getName()} (X) vs ${players[1].getName()} (O)`,
    );
  };

  const getCurrentPlayer = () => {
    return players[currentPlayer];
  };

  const switchPlayer = () => {
    currentPlayer = currentPlayer === 0 ? 1 : 0;
  };

  const checkWinner = () => {
    const board = Gameboard.getBoard();
    const patterns = Gameboard.getWinningPatterns();

    for (let pattern of patterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const checkTie = () => {
    const board = Gameboard.getBoard();
    return board.every((cell) => cell !== "") && !checkWinner();
  };

  const playRound = (index) => {
    if (gameOver) {
      console.log("Game over! Start a new game.");
      return false;
    }

    if (!Gameboard.isPositionAvailable(index)) {
      console.log("Position already taken or invalid!");
      return false;
    }

    const currentPlayer = getCurrentPlayer();
    Gameboard.setMark(index, currentPlayer.getMark());
    console.log(
      `${currentPlayer.getName()} placed ${currentPlayer.getMark()} at position ${index}`,
    );

    const winner = checkWinner();
    if (winner) {
      gameOver = true;
      console.log(`${currentPlayer.getName()} wins!`);
      console.log(Gameboard.getBoard());
      return true;
    }

    if (checkTie()) {
      gameOver = true;
      console.log("It's a tie!");
      console.log(Gameboard.getBoard());
      return true;
    }

    switchPlayer();
    console.log(
      `Current player: ${getCurrentPlayer().getName()} (${getCurrentPlayer().getMark()})`,
    );
    return true;
  };

  const reset = () => {
    Gameboard.reset();
    currentPlayer = 0;
    gameOver = false;
    console.log("Game reset!");
  };

  const isGameOver = () => {
    return gameOver;
  };

  return {
    startGame,
    playRound,
    getCurrentPlayer,
    reset,
    isGameOver,
    checkWinner,
    checkTie,
  };
})();

const DisplayController = (() => {
  const fields = document.querySelectorAll(".field");

  let playerNames = ["", ""];

  const render = () => {
    const board = Gameboard.getBoard();

    fields.forEach((field, index) => {
      field.textContent = board[index];
    });
  };

  const bindEvents = () => {
    fields.forEach((field, index) => {
      field.addEventListener("click", () => {
        if (GameController.isGameOver()) return;

        const success = GameController.playRound(index);
        if (success) {
          render();
          updateStatus();
        }
      });
    });
  };

  const init = () => {
    bindEvents();
    render();
    updateStatus();
  };

  const statusText = document.querySelector(".status");
  const startBtn = document.querySelector(".buttons button:nth-child(3)");
  const resetBtn = document.querySelector(".buttons button:nth-child(4)");
  const joinBtn = document.querySelectorAll(".join");

  startBtn.disabled = true;

  startBtn.addEventListener("click", () => {
    GameController.startGame(playerNames[0], playerNames[1]);
    render();
    updateStatus();
  });

  resetBtn.addEventListener("click", () => {
    GameController.reset();
    resetPlayers();
    render();
    updateStatus();
  });

  const openJoinDialog = (playerIndex) => {
    const dialog = document.createElement("dialog");
    const form = document.createElement("form");
    const input = document.createElement("input");
    const confirmBtn = document.createElement("button");

    input.type = "text";
    input.placeholder = `Player ${playerIndex + 1} name`;
    input.required = true;

    confirmBtn.type = "submit";
    confirmBtn.textContent = "Join";

    form.append(input);
    dialog.appendChild(form);
    document.body.appendChild(dialog);

    dialog.showModal();
    input.focus();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      playerNames[playerIndex] = input.value.trim();
      joinBtn[playerIndex].textContent = playerNames[playerIndex];
      joinBtn[playerIndex].disabled = true;

      dialog.close();
      dialog.remove();

      checkStartReady();
    });
  };

  const resetPlayers = () => {
    playerNames = ["", ""];

    joinBtn.forEach((btn) => {
      btn.textContent = "Join";
      btn.disabled = false;
    });

    startBtn.disabled = true;
  };

  const checkStartReady = () => {
    if (playerNames.every((name) => name !== "")) {
      startBtn.disabled = false;
    }
  };

  joinBtn.forEach((btn, index) => {
    btn.addEventListener("click", () => openJoinDialog(index));
  });

  const updateStatus = () => {
    if (GameController.isGameOver()) {
      const winner = GameController.checkWinner();

      if (winner) {
        statusText.textContent = `${winner} wins!`;
      } else {
        statusText.textContent = "It's a tie!";
      }
    } else {
      const player = GameController.getCurrentPlayer();
      statusText.textContent = `${player.getName()}'s turn (${player.getMark()})`;
    }
  };

  return {
    init,
    render,
  };
})();

GameController.startGame("Player 1", "Player 2");
DisplayController.init();
