var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const board = data.split('\n').map(line => [...line.trim()]);
const dimensions = { yMax: board.length, xMax: board[0].length };
const isInBounds = ([y, x]) =>((y >= 0 && y < dimensions.yMax) && (x >= 0 && x < dimensions.xMax));

const antennaMap = board
.flatMap((line, y) => line.map((symbol, x) => [symbol, y, x]))
.filter(([symbol]) => symbol !== ".")
.reduce(
    (acc, [symbol, y, x]) => ((acc[symbol] ??= []).push([y, x]), acc),
    {}
);

// Part 1
function solve(antinodesForAntennaPair) {
    const blockedPositions = Object.values(antennaMap)
      .flatMap((positions) =>
        positions
          .slice(0, -1)
          .flatMap((pos1, idx) =>
            positions.slice(idx + 1).flatMap((pos2) => antinodesForAntennaPair(pos1, pos2))
          )
      )
      .map((p) => p.toString());

    return (new Set(blockedPositions)).size;
}

const findAntinodePositions = ([y1, x1], [y2, x2]) => {
    const [dy, dx] = [y2 - y1, x2 - x1];
    return [[y2 + dy, x2 + dx], [y1 - dy, x1 - dx]].filter(isInBounds);
}

console.log(solve(findAntinodePositions))


// Part 2
const findHarmonicsInDirection = ([y, x], [dy, dx]) => {
    let i = 0;
    let harmonics = [];
    while (isInBounds([y + i*dy, x + i*dx])) {
        harmonics.push([y + i*dy, x + i*dx]);
        i++;
    }
    return harmonics;
}

const findHarmonics = ([y1, x1], [y2, x2]) => {
    const [dy, dx] = [y2 - y1, x2 - x1];
    return [...findHarmonicsInDirection([y1, x1], [dy, dx]), ...findHarmonicsInDirection([y1, x1], [-dy, -dx])]
}

console.log(solve(findHarmonics));
