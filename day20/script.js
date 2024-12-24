var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const board = data.trim().split('\n').map(line => line.trim().split(''));
const dimensions = [board.length, board[0].length];
const isInBounds = ([y, x], [yMax, xMax]=dimensions) => (x >= 0 && x < xMax) && (y >= 0 && y < yMax);

const TileTypes = {
  FREE: '.',
  WALL: '#',
  START: 'S',
  END: 'E',
}
const neighbours = [[-1,0],[1,0],[0,-1],[0,1]];

const findFirstTileOfType = (board, type) => {
  for (let y = 0; y < board.length; y++)
      for (let x = 0; x < board[y].length; x++)
          if (board[y][x] === type) return [y, x];
  return null;
}

function findDistances(board) {
  let distances = board.map(row => row.slice().fill(undefined));
  const [yEnd, xEnd] = findFirstTileOfType(board, TileTypes.END);
  distances[yEnd][xEnd] = 0;
  let queue = [[yEnd, xEnd]];

  while (queue.length > 0) {
    const [y, x] = queue.shift();

    neighbours
      .map(([dy, dx]) => [y+dy, x+dx])
      .filter((pos) => isInBounds(pos))
      .filter(([yn, xn]) => board[yn][xn] !== TileTypes.WALL)
      .filter(([yn, xn]) => distances[yn][xn] === undefined)
      .forEach(([yn, xn]) => {
        distances[yn][xn] = distances[y][x] + 1;
        queue.push([yn, xn]);
      });
  }

  return distances;
}


function generateJumpLocations([min, max]) {
  let locs = [];
  for (let i = 0; i <= max; i++) {
    for (let j = Math.max(0, min-i); j <= max-i; j++) {
      locs.push([i,j])
      if (i > 0) locs.push([-i, j]);
      if (j > 0) locs.push([i,-j]);
      if (i > 0 && j > 0) locs.push([-i,-j]);
    }
  }
  return locs;
}

function findCheats(board, cheatRange, minDistance) {
  const distances = findDistances(board);
  const jumpLocations = generateJumpLocations(cheatRange);
  let possibleCheats = [];

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (distances[y][x] === undefined) continue;

      jumpLocations.map(([dy, dx]) => [[y+dy, x+dx], Math.abs(dy) + Math.abs(dx)])
        .filter(([pos]) => isInBounds(pos))
        .filter(([[yn, xn]]) => distances[yn][xn] !== undefined)
        .forEach(([[yn, xn], jumpDist]) => {
          const distanceSaved = distances[y][x] - (jumpDist + distances[yn][xn]);
          if (distanceSaved >= minDistance) possibleCheats.push([[y, x], [yn, xn], distanceSaved]);
        });
    }
  }

  return possibleCheats.length;
}

const part1 = findCheats(board, [2,2], 12);
console.log(part1);


// Part 2
const part2 = findCheats(board, [2,20], 100);
console.log(part2);
