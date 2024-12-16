var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const loadRobots = () => (
    data.trim().split('\n')
        .map(line => [...line.matchAll(/-?\d+/g)].map(v => parseInt(v)))
        .map(([x, y, dx, dy]) => [y, x, dy, dx])
);
const dimensions = {xMax: 101, yMax: 103};
// const dimensions = {xMax: 11, yMax: 7};

function drawBoard(positions, toFile=false) {
    const board = [...new Array(dimensions.yMax)].map(() => (new Array(dimensions.xMax)).fill(0));
    positions.forEach(([y,x]) => board[y][x]++);

    // Drawing
    const prefixWidth = board.length.toString().length;
    const lines = board.map(row => row.map((c) => (c===0) ? '.' : c))
        .map((row, y) => y.toString().padStart(prefixWidth) + ' ' + row.join(''));

    console.log("Board:");
    lines.forEach(line => console.log(line));
    console.log('\n');

    if (toFile) fs.writeFileSync(path.join(__dirname, "solution.map"), lines.join('\n'));
}

const calcRobotPosition = ([y, x, dy, dx], iterations) => {
    let newX = (x + iterations * dx) % dimensions.xMax;
    let newY = (y + iterations * dy) % dimensions.yMax;

    while (newX < 0) newX += dimensions.xMax;
    while (newY < 0) newY += dimensions.yMax;

    return [newY, newX, dy, dx];
}

const toQuadrant = ([y,x]) => {
    if (2*y + 1 === dimensions.yMax) return null; // On H boundary
    if (2*x + 1 === dimensions.xMax) return null; // On V boundary
    return 1 + ((2*y > dimensions.yMax) ? 2 : 0) + ((2*x > dimensions.xMax) ? 1 : 0);
}

const calcSafetyFactor = (positions) => {
    const quartersMap = positions.map(toQuadrant).filter(q => q !== null)
        .reduce((counts, q) => (counts[q-1]++, counts), [0,0,0,0])
    const safetyFactor = quartersMap.reduce((sum, qCount) => sum * qCount, 1);
    return safetyFactor;
}

function part1() {
    const robots = loadRobots();
    const endPositions = robots.map(config => calcRobotPosition(config, 100));
    return calcSafetyFactor(endPositions);
}

console.log(part1());

// Part 2
function isPotentialChristmasTree(positions) {
    const board = [...new Array(dimensions.yMax)].map(() => (new Array(dimensions.xMax)).fill('.'));
    positions.forEach(([y,x]) => board[y][x] = 'X');
    return board.filter(row => row.join('').includes('XXXXXXXXXX')).length > 0
}

function part2() {
    let robots = loadRobots();
    let i = 0;
    while (i++ < 1e5) {
        robots = robots.map((config) => calcRobotPosition(config, 1))
        if (isPotentialChristmasTree(robots)) {
            drawBoard(robots, true);
            console.log(`Potential tree at: ${i}`);
            console.log();
        }
    }
}

part2();

