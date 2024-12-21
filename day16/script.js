var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const loadBoard = () => data.trim().split('\n').map(line => line.trim().split(''));
const board = loadBoard();

const TileType = {
    END: "E",
    START: "S",
    WALL: "#",
    FLOOR: ".",
};

const MoveCost = {
    TURN: 1000,
    WALK: 1,
}

const toKey = ([y,x], [dy, dx]) => [y, x, dy, dx].toString();
const fromKey = (key) => [key.split(',').map(v => parseInt(v))].flatMap(([y,x,dy,dx]) => [[y,x], [dy,dx]]);
const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function drawBoard(board, toFile=false) {
    const prefixWidth = board.length.toString().length;
    const lines = board.map(row => row.map((c) => (c===0) ? '.' : c))
        .map((row, y) => y.toString().padStart(prefixWidth) + ' ' + row.join(''));

    console.log("Board:");
    lines.forEach(line => console.log(line));
    console.log('\n');

    if (toFile) fs.writeFileSync(path.join(__dirname, "solution.map"), lines.join('\n'));
}

function drawSolution(steps, startPosition, endPosition) {
    let finalBoard = loadBoard();
    steps.reverse().map(fromKey).forEach(([[y,x], [dy, dx]]) => {
        if (dy === 1) finalBoard[y][x] = 'v'
        if (dy === -1) finalBoard[y][x] = '^'
        if (dx === 1) finalBoard[y][x] = '>'
        if (dx === -1) finalBoard[y][x] = '<'
    });
    [[startPosition, TileType.START], [endPosition, TileType.END]].forEach(([[y, x], t]) => board[y][x] = t);
    drawBoard(finalBoard);
}

// Part 1
const findFirstTileOfType = (board, type) => {
    for (let y = 0; y < board.length; y++)
        for (let x = 0; x < board[y].length; x++)
            if (board[y][x] === type) return [y, x];

    return null;
}

function findShortestPath(board) {
    const startPosition = findFirstTileOfType(board, TileType.START);
    const endPosition = findFirstTileOfType(board, TileType.END);

    let distances = {};
    let toProcess = [[startPosition, [0, 1], 0]]; // node, direction, distance. Start facing East
    let enteredFrom = {};

    let endKey = null;
    while (toProcess.length > 0) {
        toProcess.sort((a,b) => a[2] - b[2]) // Make sure order reflects current distances
        const [stepPosition, stepDirection, stepDistance] = toProcess.shift();
        const [y0, x0] = stepPosition;
        const [dy0, dx0] = stepDirection;
        const stepKey = toKey(stepPosition, stepDirection)
        distances[stepKey] = stepDistance;

        if (y0 === endPosition[0] && x0 === endPosition[1]) {
            endKey = stepKey;
            return {enteredFrom, distances, endKey, startPosition, endPosition};
        }

        // Determine reachable states
        directions.map(([dy, dx]) => ([(dy===dy0 && dx===dx0) ? [y0 + dy, x0 + dx] : [y0, x0], [dy, dx]])) // Move if same direction, otherwise turn in place
            .filter(([[y, x]]) => board[y][x] !== TileType.WALL)
            .forEach(([[y, x], [dy, dx]]) => {
                const neighbourKey = toKey([y,x], [dy, dx]);
                if (distances[neighbourKey] !== undefined) return;
                const newDistance = stepDistance + ((dy===dy0 && dx===dx0) ? MoveCost.WALK : MoveCost.TURN);
                const idx = toProcess.findIndex(([p, d]) => neighbourKey === toKey(p, d));
                if (idx === -1) {
                    toProcess.push([[y, x], [dy, dx], newDistance]);
                    enteredFrom[neighbourKey] = stepKey;
                } else if (newDistance < toProcess[idx][2]) {
                    toProcess[idx][2] = newDistance;
                    enteredFrom[neighbourKey] = stepKey;
                }
            });
    }

    return null; // No path found
}

function reconstructPath(endNodeKey, enteredFrom) {
    let steps = [];
    let currentStep = endNodeKey;
    while (currentStep !== undefined) {
        steps.push(currentStep);
        currentStep = enteredFrom[currentStep];
    }
    return steps;
}

function part1() {
    const { enteredFrom, distances, endKey, startPosition, endPosition } = findShortestPath(board);
    const steps = reconstructPath(endKey, enteredFrom);

    // Draw board + path
    drawSolution(steps, startPosition, endPosition);
    console.log(distances[endKey]);
}

part1()

