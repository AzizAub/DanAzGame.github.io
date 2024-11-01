// Получаем ссылку на HTML-элемент с id "board" и элемент для отображения текущего игрока
const board = document.getElementById("board");
const currentPlayerText = document.getElementById("current-player");

// Определяем ряды и колонки
const rows = 8;
const cols = 8;

// Переменная для отслеживания выбранной шашки и текущего игрока
let selectedPiece = null;
let turn = "white";

// Функция для инициализации доски
function initializeBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell", (row + col) % 2 === 0 ? "white" : "black");
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (row < 3 && (row + col) % 2 !== 0) {
        addPiece(cell, "black");
      } else if (row > 4 && (row + col) % 2 !== 0) {
        addPiece(cell, "white");
      }

      cell.addEventListener("click", onCellClick);
      board.appendChild(cell);
    }
  }
}

// Функция для добавления шашек на доску
function addPiece(cell, color) {
  const piece = document.createElement("div");
  piece.classList.add("piece", color);
  piece.dataset.color = color;
  piece.dataset.king = "false";
  cell.appendChild(piece);
}

// Обработка кликов по клеткам
function onCellClick(e) {
    const cell = e.target.closest(".cell");
    if (!cell) return;

    const piece = cell.querySelector(".piece");

    // Удаляем подсветку со всех шашек перед обработкой нового выбора
    document.querySelectorAll(".piece.selected").forEach((p) => {
        p.classList.remove("selected");
    });

    if (selectedPiece) {
        // Если ход был выполнен, убираем подсветку
        if (canMove(selectedPiece, cell)) {
            movePiece(selectedPiece, cell);
            selectedPiece = null;
        } else {
            selectedPiece = null;
        }
    } else if (piece && piece.dataset.color === turn) {
        selectedPiece = piece;
        selectedPiece.classList.add("selected"); // Добавляем подсветку к новой выбранной шашке
    }
}

// Проверка возможности хода на целевую клетку
function canMove(piece, targetCell) {
  const startRow = parseInt(piece.parentElement.dataset.row);
  const startCol = parseInt(piece.parentElement.dataset.col);
  const endRow = parseInt(targetCell.dataset.row);
  const endCol = parseInt(targetCell.dataset.col);
  const direction = piece.dataset.color === "white" ? -1 : 1;
  const isKing = piece.dataset.king === "true";

  if (targetCell.querySelector(".piece")) {
    return false;
  }

  if (!isKing) {
    return canMoveRegular(piece, startRow, startCol, endRow, endCol, direction);
  } else {
    return canMoveKing(piece, startRow, startCol, endRow, endCol);
  }
}

// Проверка возможности хода для обычной шашки
function canMoveRegular(piece, startRow, startCol, endRow, endCol, direction) {
  if (Math.abs(endRow - startRow) === 1 && Math.abs(endCol - startCol) === 1 && endRow - startRow === direction) {
    return true;
  }

  if (Math.abs(endRow - startRow) === 2 && Math.abs(endCol - startCol) === 2 && endRow - startRow === 2 * direction) {
    const middleRow = (startRow + endRow) / 2;
    const middleCol = (startCol + endCol) / 2;
    const middleCell = document.querySelector(`.cell[data-row="${middleRow}"][data-col="${middleCol}"]`);
    const middlePiece = middleCell.querySelector(".piece");

    if (middlePiece && middlePiece.dataset.color !== piece.dataset.color) {
      return true;
    }
  }

  return false;
}

// Проверка возможности хода для дамки
function canMoveKing(piece, startRow, startCol, endRow, endCol) {
  if (Math.abs(endRow - startRow) === Math.abs(endCol - startCol)) {
    let pathClear = true;
    let middlePieceCaptured = false;
    const rowStep = endRow > startRow ? 1 : -1;
    const colStep = endCol > startCol ? 1 : -1;

    for (let i = 1; i < Math.abs(endRow - startRow); i++) {
      const intermediateCell = document.querySelector(`.cell[data-row="${startRow + i * rowStep}"][data-col="${startCol + i * colStep}"]`);
      const pieceOnPath = intermediateCell.querySelector(".piece");

      if (pieceOnPath) {
        if (pieceOnPath.dataset.color !== piece.dataset.color) {
          if (middlePieceCaptured) {
            pathClear = false;
            break;
          } else {
            middlePieceCaptured = true;
          }
        } else {
          pathClear = false;
          break;
        }
      }
    }

    if (pathClear) {
      return true;
    }
  }

  return false;
}

// Перемещение шашки на новую клетку
function movePiece(piece, targetCell) {
  const startRow = parseInt(piece.parentElement.dataset.row);
  const startCol = parseInt(piece.parentElement.dataset.col);
  const endRow = parseInt(targetCell.dataset.row);
  const endCol = parseInt(targetCell.dataset.col);

  if (Math.abs(endRow - startRow) === 2 && Math.abs(endCol - startCol) === 2) {
    const middleRow = (startRow + endRow) / 2;
    const middleCol = (startCol + endCol) / 2;
    const middleCell = document.querySelector(`.cell[data-row="${middleRow}"][data-col="${middleCol}"]`);
    const middlePiece = middleCell.querySelector(".piece");

    if (middlePiece) {
      middleCell.removeChild(middlePiece);
    }
  }

  targetCell.appendChild(piece);

  if ((piece.dataset.color === "white" && endRow === 0) || (piece.dataset.color === "black" && endRow === 7)) {
    piece.dataset.king = "true";
    piece.classList.add("king");
  }

  turn = turn === "white" ? "black" : "white";
  currentPlayerText.textContent = `Ход: ${turn === "white" ? "Белые" : "Чёрные"}`;
  selectedPiece = null;
  checkGameState();
}

// Проверка состояния игры
function checkGameState() {
  let whiteCount = 0;
  let blackCount = 0;
  let whiteHasMoves = false;
  let blackHasMoves = false;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
      const piece = cell.querySelector(".piece");

      if (piece) {
        if (piece.dataset.color === "white") {
          whiteCount++;
          if (!whiteHasMoves && hasValidMoves(piece)) {
            whiteHasMoves = true;
          }
        } else if (piece.dataset.color === "black") {
          blackCount++;
          if (!blackHasMoves && hasValidMoves(piece)) {
            blackHasMoves = true;
          }
        }
      }
    }
  }

  if (whiteCount === 0 || !whiteHasMoves) {
    alert("Чёрные выигрывают!");
    disableBoard();
  } else if (blackCount === 0 || !blackHasMoves) {
    alert("Белые выигрывают!");
    disableBoard();
  }
}

// Проверка наличия допустимых ходов
function hasValidMoves(piece) {
  const startRow = parseInt(piece.parentElement.dataset.row);
  const startCol = parseInt(piece.parentElement.dataset.col);
  const directions = piece.dataset.king === "true"
    ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    : piece.dataset.color === "white"
      ? [[-1, 1], [-1, -1]]
      : [[1, 1], [1, -1]];

  for (let [dr, dc] of directions) {
    const newRow = startRow + dr;
    const newCol = startCol + dc;

    if (isValidPosition(newRow, newCol)) {
      const targetCell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
      if (!targetCell.querySelector(".piece")) {
        return true;
      }
      const jumpRow = startRow + 2 * dr;
      const jumpCol = startCol + 2 * dc;
      if (isValidPosition(jumpRow, jumpCol)) {
        const middleCell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
        const jumpCell = document.querySelector(`.cell[data-row="${jumpRow}"][data-col="${jumpCol}"]`);
        const middlePiece = middleCell.querySelector(".piece");
        if (middlePiece && middlePiece.dataset.color !== piece.dataset.color && !jumpCell.querySelector(".piece")) {
          return true;
        }
      }
    }
  }

  return false;
}

// Проверка допустимости позиции
function isValidPosition(row, col) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

// Отключение доски
function disableBoard() {
  document.querySelectorAll(".cell").forEach(cell => cell.removeEventListener("click", onCellClick));
}

// Инициализация игры
initializeBoard();
