var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const board = data.split('\n').map(line => [...line.trim()]);
const dimensions = [board.length, board[0].length];
const isInBounds = ([y, x], [yMax, xMax]=dimensions) => (x >= 0 && x < xMax) && (y >= 0 && y < yMax);

const TILES = {
    START: "^",
    BLOCKED: "#",
    FREE: ".",
    VISITED: "X",
};

function findStartPosition(board) {
    for (let y = 0; y < board.length; y++)
        for (let x = 0; x < board[0].length; x++)
            if (board[y][x] == TILES.START) return [y,x];

    throw Error("Start not found.");
}

function drawBoard(boardToDraw, rotations=[], toFile=false) {
    // Update map copy with directions
    let board = boardToDraw.map(row => row.slice());
    rotations.map(v => v.split(',')).forEach(([y, x, dy, dx]) => {
        if (dy == -1) {
            board[y][x] = "^"
        } else if (dy == 1) {
            board[y][x] = "v"
        } else if (dx == -1) {
            board[y][x] = "<"
        } else if (dx == 1) {
            board[y][x] = ">"
        }
    });


    // Drawing
    const prefixWidth = board.length.toString().length;
    let lines = [];
    board.forEach((row, y) => lines.push(y.toString().padStart(prefixWidth) + ' ' + row.join('')));

    console.log("Board:");
    lines.forEach(line => console.log(line));
    console.log('\n');

    if (toFile) fs.writeFileSync(path.join(__dirname, "solution.map"), lines.join('\n'));
}


// Part 1
function simulatePatrol(initialBoard) {
    let board = initialBoard.map(row => row.slice());
    let position = findStartPosition(board);
    let direction = [-1, 0]; // Always face up
    let rotations = []; // track rotations to prevent getting stuck.
    let distinctTilesVisited = 0;

    const getTile = ([y, x]=position) => board[y][x];
    const getNextPosition = ([y, x]=position, [dy, dx]=direction) => [y + dy, x + dx];
    const rotateRight = ([dy, dx]=direction) => [dx, -dy];
    const getKey = ([y, x]=position, [dy, dx]=direction) => `${y},${x},${dy},${dx}`;
    const setTile = ([y, x]=position, tileType=TILES.VISITED) => board[y][x] = tileType;

    while (true) {
        if (getTile(position) !== TILES.VISITED) {
            setTile(position, TILES.VISITED);
            distinctTilesVisited++;
        }

        // Get next position
        let nextPosition = getNextPosition();
        if (!isInBounds(nextPosition)) {
            // drawBoard(board, rotations)
            console.log(`Out of bounds detected at: '${getKey()}'`);
            break;
        }

        if (getTile(nextPosition) === TILES.BLOCKED) {
            // Need to rotate
            if (rotations.includes(getKey())) {
                console.log(`Cycle detected at: '${getKey()}'`);
                break;
            }
            rotations.push(getKey());

            // drawBoard(board, rotations)
            direction = rotateRight(direction);
        } else {
            // Take a step
            position = nextPosition;
        }
    }

    drawBoard(board, rotations, toFile=true);
    return distinctTilesVisited;
}


tilesVisited = simulatePatrol(board);
console.log(tilesVisited);

