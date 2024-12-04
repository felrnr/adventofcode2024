var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const grid = data.split('\n').map(line => [...line.trim()])
const dimensions = [grid.length, grid[0].length];
const isInBounds = ([y, x], [yMax, xMax]=dimensions) => (x >= 0 && x < xMax) && (y >= 0 && y < yMax);

const DIRECTIONS = (() => {
    // [dy, dx]
    const U = [-1, 0];
    const D = [1, 0];
    const L = [0, -1];
    const R = [0, 1];

    const UL = [-1, -1];
    const UR = [-1, 1];
    const DL = [1, -1];
    const DR = [1, 1];

    const straight = [U, D, L, R];
    const diagonal = [UL, UR, DL, DR];
    const all = [...straight, ...diagonal];

    return {U, D, L, R, UL, UR, DL, DR, straight, diagonal, all};
})();


// Part 1
function checkDirection(startPos, direction, searchWord = 'XMAS') {
    const [y0, x0] = startPos;
    const [dy, dx] = direction;

    return [...searchWord]
        .map((letter, i) => [letter, y0 + i*dy, x0 + i*dx])
        .every(([letter, y, x]) => isInBounds([y, x]) && letter === grid[y][x]);
}


function part1() {
    let counter = 0;

    for (let y = 0; y < dimensions[0]; y++)
        for (let x = 0; x < dimensions[1]; x++)
            counter += DIRECTIONS.all.reduce((t, direction) => t + (checkDirection([y, x], direction) ? 1 : 0), 0)

    return counter;
}

console.log(part1());


// Part 2
function part2() {
    let counter = 0;

    for (let y = 0; y < dimensions[0]; y++) {
        for (let x = 0; x < dimensions[1]; x++) {
            if (grid[y][x] !== 'A') continue;

            const diagonalMatches = DIRECTIONS.diagonal
                .map(([dy, dx]) => [[y-dy, x-dx], [dy, dx]])
                .reduce((t, [startPos, direction]) => t + (checkDirection(startPos, direction, searchWord="MAS") ? 1 : 0), 0);

            if (diagonalMatches > 1) counter ++;
        }
    }

    return counter;
}

console.log(part2());
