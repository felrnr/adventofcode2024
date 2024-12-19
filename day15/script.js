var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const loadData = (postProcess=((t) => [t])) => {
    const [boardBlock, directionBlock] = data.trim().split('\n\n');
    const directions = directionBlock.replaceAll(/\s+/g, '').split('');
    const board = boardBlock.split('\n')
        .map(line => line.trim().split('').flatMap(postProcess));
    const dimensions = [board.length, board[0].length];
    return {board, directions, dimensions};
};
const initialState = loadData();

const isInBounds = ([y, x], [yMax, xMax]=initialState.dimensions) => (x >= 0 && x < xMax) && (y >= 0 && y < yMax);

const directionMap = {
    '^': [-1, 0],
    '>': [0, 1],
    'v': [1, 0],
    '<': [0, -1],
}

const TileType = {
    WALL: "#",
    BOX: "O",
    ROBOT: "@",
    FREE: ".",
    BOX_L: "[",
    BOX_R: "]",
};

function drawBoard(board, toFile=false) {
    // Drawing
    const prefixWidth = board.length.toString().length;
    const lines = board.map(row => row.map((c) => (c===0) ? '.' : c))
        .map((row, y) => y.toString().padStart(prefixWidth) + ' ' + row.join(''));

    console.log("Board:");
    lines.forEach(line => console.log(line));
    console.log('\n');

    if (toFile) fs.writeFileSync(path.join(__dirname, "solution.map"), lines.join('\n'));
}

// Part 1
const isValidMove = (board, [y, x], [dy, dx]) => {
    while(isInBounds([y+dy, x+dx])) {
        x += dx, y += dy;
        if (board[y][x] === TileType.WALL) return false;
        if (board[y][x] === TileType.FREE) return true;
    }
    return false;
};

const findFirstTileOfType = (board, type) => {
    for (let y = 0; y < board.length; y++)
        for (let x = 0; x < board[y].length; x++)
            if (board[y][x] === type) return [y, x];

    return null;
}

function moveRobot(board, [y_robot, x_robot], [dy, dx]) {
    if (!isValidMove(board, [y_robot, x_robot], [dy, dx])) return [y_robot, x_robot];
    let [y,x] = [y_robot, x_robot];

    // Push everything forward untill wall.
    let currentPiece = TileType.FREE;
    do {
        [board[y][x], currentPiece] = [currentPiece, board[y][x]]; // Swap piece
        [y, x] = [y+dy, x+dx];
    } while(!(currentPiece === TileType.WALL || currentPiece === TileType.FREE))

    return [y_robot+dy, x_robot+dx];
}

const calcGPSCoordinate = ([y,x]) => 100*y + x;

function simulate(scoreTile, fRobotStep, fPostProcess) {
    let {board, directions} = loadData(fPostProcess);
    let robotPos = findFirstTileOfType(board, TileType.ROBOT);
    directions.forEach(d => {
        // console.log(`Move ${d}:`);
        robotPos = fRobotStep(board, robotPos, directionMap[d]);

        // drawBoard(board)
    });

    // Compute score
    const scores = board.map((row, y) =>
        row.map((tile, x) => (tile === scoreTile) ? calcGPSCoordinate([y,x]) : 0)
            .reduce((rowSum, gps) => rowSum + gps, 0))
    return scores.reduce((sum, rowSum) => sum + rowSum, 0);
}

const part1 = simulate(TileType.BOX, moveRobot);
console.log(part1)


// Part 2
const getBox = (board, [y,x]) => ((board[y][x] === TileType.BOX_L) ? [[y, x], [y, x+1]] : [[y, x-1], [y, x]]);

// Return a list of box tiles that should also move resulting from the robot move.
// If any hit a wall, the move is invalid and return value is NULL.
function shouldMoveRobot(board, [y_robot, x_robot], [dy, dx]) {
    if (board[y_robot + dy][x_robot + dx] === TileType.WALL) return null;
    if (board[y_robot + dy][x_robot + dx] === TileType.FREE) return [];

    // Track all moved boxes.
    let discovered = new Set();
    let boxesToMove = [];
    let toProcess = [getBox(board, [y_robot + dy, x_robot + dx])];
    discovered.add(toProcess[0][0].toString());

    while (toProcess.length > 0) {
        const boxParts = toProcess.shift();
        boxesToMove.push(boxParts);

        const newBoxPositions = boxParts.map(([y,x]) => [y+dy, x+dx]) // Push both parts of the box

        // Check wall collision
        const hasWallCollision = newBoxPositions.some(([y, x]) => board[y][x] === TileType.WALL);
        if (hasWallCollision) return null; // invalid move

        // Check box collision
        newBoxPositions.filter(([y, x])  => [TileType.BOX_L, TileType.BOX_R].includes(board[y][x]))
            .map((nextPos) => getBox(board, nextPos))
            .forEach(([box_l, box_r]) => {
                if (discovered.has(box_l.toString())) return;
                discovered.add(box_l.toString());
                toProcess.push([box_l, box_r]);
            });
    }

    return boxesToMove;
}

const setTile = (board, [y,x], tile) => board[y][x] = tile;

function moveRobot2(board, [y_robot, x_robot], [dy, dx]) {
    const boxesToMove = shouldMoveRobot(board, [y_robot, x_robot], [dy, dx]);
    if (boxesToMove === null) return [y_robot, x_robot];

    // Move boxes; Clear and move to new position
    boxesToMove.flat().forEach((pos) => setTile(board, pos, TileType.FREE));
    boxesToMove.flatMap((boxTiles => boxTiles.map(([y,x], idx) => [[y+dy, x+dx], (idx===0) ? TileType.BOX_L : TileType.BOX_R])))
        .forEach(([pos, tile]) => setTile(board, pos, tile));

    // Move robot
    board[y_robot][x_robot] = TileType.FREE;
    board[y_robot + dy][x_robot + dx] = TileType.ROBOT;

    return [y_robot+dy, x_robot+dx];
}

const postProcess = (tile) => [...{"#": "##", "O": "[]", ".": "..", "@": "@."}[tile]];
const part2 = simulate(TileType.BOX_L, moveRobot2, postProcess)
console.log(part2);
