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
    HORIZONTAL: '-',
    VERTICAL: '|',
};

function findStartPosition(board) {
    for (let y = 0; y < board.length; y++)
        for (let x = 0; x < board[0].length; x++)
            if (board[y][x] == TILES.START) return [y,x];

    throw Error("Start not found.");
}

function drawBoard(boardToDraw, rotations=[], toFile=false, overwritePositions=[]) {
    // Update map copy with directions
    let board = boardToDraw.map(row => row.slice());

    rotations.map(v => v.split(',')).forEach(([y, x]) => board[y][x] = "+");
    overwritePositions.forEach(([y, x, symbol]) => board[y][x] = symbol);
    // rotations.map(v => v.split(',')).forEach(([y, x, dy, dx]) => {
    //     if (dy == -1) {
    //         board[y][x] = "^"
    //     } else if (dy == 1) {
    //         board[y][x] = "v"
    //     } else if (dx == -1) {
    //         board[y][x] = "<"
    //     } else if (dx == 1) {
    //         board[y][x] = ">"
    //     }
    // });


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

    drawBoard(board, rotations, true);
    return distinctTilesVisited;
}


tilesVisited = simulatePatrol(board);
console.log(tilesVisited);

// Part 2
function simulatePatrol2(initialBoard, initialPosition, initialDirection=[-1, 0], initialRotations=[], initialTileVisits=null, allowObstaclePlacement=false, drawOverwrites={}) {
    let board = initialBoard.map(row => row.slice());
    let position = initialPosition;
    let direction = initialDirection; // Always face up
    let rotations = [...initialRotations]; // track rotations to prevent getting stuck.
    let tileVisits =
        (initialTileVisits===null)
        ? initialBoard.map(row => row.map(() => new Set()))
        : initialTileVisits.map(row => row.map(visits => new Set(visits)));
    let potentialObstacles = new Set();

    const getTile = ([y, x]=position) => board[y][x];
    const setTile = ([y, x]=position, tile) => board[y][x] = tile;
    const getNextPosition = ([y, x]=position, [dy, dx]=direction) => [y + dy, x + dx];
    const rotateRight = ([dy, dx]=direction) => [dx, -dy];
    const getKey = ([y, x]=position, [dy, dx]=direction) => `${y},${x},${dy},${dx}`;
    const getDirectionKey = ([dy, dx]=direction) => `${dy},${dx}`;
    const getVisits = ([y,x]=position) => tileVisits[y][x];
    const visitTile = ([y, x]=position, [dy, dx]=direction) => {
        const directionKey = getDirectionKey([dy,dx]);
        if (tileVisits[y][x].has(directionKey)) return false;

        board[y][x] = (Math.abs(dy) === 0) ? TILES.HORIZONTAL : TILES.VERTICAL;
        tileVisits[y][x].add(directionKey);
        return true;
    }

    const canPlaceObstacle = ([y,x]=position, [dy, dx]=direction) => {
        const positionAhead = getNextPosition([y,x], [dy, dx]);
        if (!isInBounds(positionAhead)) return false; // Obstacle location out of bounds
        const tileAhead = getTile(positionAhead);
        if (positionAhead.toString() === initialPosition.toString()) return false; // Guard spawn location
        return tileAhead !== TILES.BLOCKED;
    }

    while (true) {
        // if (getVisits(position).has(getDirectionKey())) {
        //     drawBoard(board, rotations)
        //     console.log(`Revisited tile in same direction: '${getKey()}'`);
        //     return -1;
        // }

        // // Check if placing an obstacle ahead leads to looping.
        // if (allowObstaclePlacement && canPlaceObstacle(position, direction)) {
        //     const nextPosition = getNextPosition();
        //     const oldTile = getTile(nextPosition);
        //     setTile(nextPosition, TILES.BLOCKED);
        //     if (simulatePatrol2(board, position, direction, rotations, tileVisits, false) === -1) {
        //         // -1 is looping, this is a potential obstacle location.
        //         potentialObstacles++;
        //     }
        //     setTile(nextPosition, oldTile);
        // }
        setTile(position, Math.abs((direction[0]) === 0) ? TILES.HORIZONTAL : TILES.VERTICAL)


        // If turning here already visited, try placing obstacle
        if (allowObstaclePlacement && canPlaceObstacle()) {
            // // place obstacle and test.
            // const nextPosition = getNextPosition();
            // const oldTile = getTile(nextPosition);
            // setTile(nextPosition, TILES.BLOCKED);
            // if (simulatePatrol2(board, position, direction, rotations, tileVisits, false, [[...initialPosition, '^'],[...nextPosition, 'O']]) === -1) {
            //     // -1 is looping, this is a potential obstacle location.
            //     // drawBoard(board, rotations,false);
            //     potentialObstacles.add(nextPosition.toString());
            // }
            // setTile(nextPosition, oldTile);

            // place obstacle and test.
            const [y,x] = getNextPosition();
            const oldTile = initialBoard[y][x];
            initialBoard[y][x] = TILES.BLOCKED;
            if (simulatePatrol2(initialBoard, initialPosition, initialDirection, [], null, false, [[...initialPosition, '^'],[y, x, 'O']]) === -1) {
                // -1 is looping, this is a potential obstacle location.
                // drawBoard(board, rotations,false);
                potentialObstacles.add([y,x].toString());
            }
            initialBoard[y][x] = oldTile;
        }

        // const isNewTileVisit = visitTile(position, direction);
        // if (!isNewTileVisit) {
        //     drawBoard(board, rotations)
        //     console.log(`Revisited tile in same direction: '${getKey()}'`);
        //     return -1;
        // }
        // setTile(position, Math.abs((direction[0]) === 0) ? TILES.HORIZONTAL : TILES.VERTICAL)


        // Get next position
        let nextPosition = getNextPosition();
        if (!isInBounds(nextPosition)) {
            // drawBoard(board, rotations)
            // console.log(`Out of bounds detected at: '${getKey()}'`);
            break;
        }

        if (getTile(nextPosition) === TILES.BLOCKED) {
            // Need to rotate
            // drawBoard(board, rotations);
            if (rotations.includes(getKey())) {
                console.log(`Cycle detected at: '${getKey()}'`);
                // drawBoard(board, rotations, false, drawOverwrites);
                return -1;
            }
            rotations.push(getKey());

            // drawBoard(board, rotations)
            direction = rotateRight(direction);
        } else {
            // Take a step
            position = nextPosition;
        }
    }

    // drawBoard(board, rotations, true);
    // drawBoard(board, rotations);
    return potentialObstacles.size;
}

const initialPosition = findStartPosition(board);
console.log(simulatePatrol2(board, initialPosition, [-1, 0], [], null, true));
