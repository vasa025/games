export const GRID_SIZE = 4;
export const WIN_TILE = 2048;

export function createEmptyBoard() {
    return Array(GRID_SIZE * GRID_SIZE).fill(0);
}

export function cloneBoard(board) {
    return [...board];
}

export function getEmptyIndices(board) {
    const emptyIndices = [];
    board.forEach((value, index) => {
        if (value === 0) {
            emptyIndices.push(index);
        }
    });
    return emptyIndices;
}

export function addRandomTile(board, randomFn = Math.random) {
    const emptyIndices = getEmptyIndices(board);
    if (!emptyIndices.length) {
        return [...board];
    }

    const targetIndex = emptyIndices[Math.floor(randomFn() * emptyIndices.length)];
    const nextBoard = [...board];
    nextBoard[targetIndex] = randomFn() < 0.9 ? 2 : 4;
    return nextBoard;
}

export function createSeededRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

export function dateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function generateDailyBoard(date = new Date()) {
    const seed = dateKey(date)
        .split('')
        .reduce((total, character) => total + character.charCodeAt(0), 0);
    const randomFn = createSeededRandom(seed);
    let board = createEmptyBoard();

    board = addRandomTile(board, randomFn);
    board = addRandomTile(board, randomFn);

    return board;
}

export function slideAndMergeLine(line) {
    const compacted = line.filter((value) => value !== 0);
    const mergedLine = [];
    let mergedScore = 0;

    for (let index = 0; index < compacted.length; index += 1) {
        const current = compacted[index];
        const next = compacted[index + 1];

        if (next !== undefined && current === next) {
            const mergedValue = current * 2;
            mergedLine.push(mergedValue);
            mergedScore += mergedValue;
            index += 1;
        } else {
            mergedLine.push(current);
        }
    }

    while (mergedLine.length < line.length) {
        mergedLine.push(0);
    }

    return { line: mergedLine, scoreGain: mergedScore };
}

export function moveBoard(board, direction) {
    const rows = Array.from({ length: GRID_SIZE }, (_, rowIndex) =>
        Array.from({ length: GRID_SIZE }, (_, columnIndex) => board[rowIndex * GRID_SIZE + columnIndex]),
    );

    let moved = false;
    let scoreGain = 0;

    const processRow = (row) => {
        const workingLine = direction === 'left' ? [...row] : [...row].reverse();
        const { line: mergedLine, scoreGain: rowScore } = slideAndMergeLine(workingLine);
        scoreGain += rowScore;

        const finalLine = direction === 'left' ? mergedLine : [...mergedLine].reverse();
        if (finalLine.some((value, index) => value !== row[index])) {
            moved = true;
        }

        return finalLine;
    };

    if (direction === 'left' || direction === 'right') {
        const processedRows = rows.map((row) => processRow(row));
        const nextBoard = processedRows.flat();
        return { board: nextBoard, moved, scoreGain };
    }

    const processedColumns = Array.from({ length: GRID_SIZE }, (_, columnIndex) => {
        const column = Array.from({ length: GRID_SIZE }, (_, rowIndex) => rows[rowIndex][columnIndex]);
        const workingColumn = direction === 'up' ? [...column] : [...column].reverse();
        const { line: mergedColumn, scoreGain: columnScore } = slideAndMergeLine(workingColumn);
        scoreGain += columnScore;

        const finalColumn = direction === 'up' ? mergedColumn : [...mergedColumn].reverse();
        if (finalColumn.some((value, index) => value !== column[index])) {
            moved = true;
        }

        return finalColumn;
    });

    const nextBoard = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
        const rowIndex = Math.floor(index / GRID_SIZE);
        const columnIndex = index % GRID_SIZE;
        return processedColumns[columnIndex][rowIndex];
    });

    return { board: nextBoard, moved, scoreGain };
}

export function hasWon(board) {
    return board.some((value) => value >= WIN_TILE);
}

export function canMove(board) {
    if (board.some((value) => value === 0)) {
        return true;
    }

    for (let row = 0; row < GRID_SIZE; row += 1) {
        for (let column = 0; column < GRID_SIZE; column += 1) {
            const index = row * GRID_SIZE + column;
            const current = board[index];

            if (column < GRID_SIZE - 1 && current === board[index + 1]) {
                return true;
            }

            if (row < GRID_SIZE - 1 && current === board[index + GRID_SIZE]) {
                return true;
            }
        }
    }

    return false;
}
