var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const board = data.trim().split("\n")
  .map((line) => line.trim().split("").map((c) => parseInt(c)));

const isInBounds = ([y,x]) => ((y >= 0 && y < board.length) && (x >= 0 && x < board[0].length));
const neighbours = [[1,0], [-1,0], [0,1], [0,-1]];

console.log(board.length, board[0].length);

// Part 1
const findAllPositions = (board, val) => board.flatMap((row, y) => row.map((c, x) => [y, x])).filter(([y,x]) => board[y][x] === val);

function findReachablePeaks(board) {
    // Keep track of possible peaks reachable from given location
    let routeMap = board.map((row, y) => row.map((c, x) => (c===9) ? new Set([`${y},${x}`]) : new Set()));

    for (let targetHeight = 9; targetHeight > 0; targetHeight--) {
        findAllPositions(board, targetHeight).forEach(([y,x]) => {
            neighbours.map(([dy, dx]) => [y+dy, x+dx])
                .filter(isInBounds)
                .filter(([yn, xn]) => board[yn][xn] === targetHeight-1)
                .forEach(([yn, xn]) => routeMap[y][x].forEach((peak) => routeMap[yn][xn].add(peak)));

        });
    }
    return routeMap;
}


function part1() {
    const startPositions = findAllPositions(board, 0);
    const routeMap = findReachablePeaks(board);
    const totalScore = startPositions.reduce((t, [y, x]) => t + routeMap[y][x].size, 0);
    return totalScore;
}

console.log(part1());

// Part 2
function findDistinctTrails(board) {
    let routeMap = board.map((row) => row.map(c => (c===0) ? 1 : 0));
    for (let targetHeight = 0; targetHeight < 9; targetHeight++) {
        findAllPositions(board, targetHeight).forEach(([y,x]) => {
            neighbours.map(([dy, dx]) => [y+dy, x+dx])
                .filter(isInBounds)
                .filter(([yn, xn]) => board[yn][xn] === targetHeight+1)
                .forEach(([yn, xn]) => routeMap[yn][xn] += routeMap[y][x]);
        });
    }
    return routeMap;
}

function part2() {
    const routeMap = findDistinctTrails(board);
    const endPositions = findAllPositions(board, 9);
    const totalScore = endPositions.reduce((t, [y, x]) => t + routeMap[y][x], 0);
    return totalScore
}

console.log(part2());
