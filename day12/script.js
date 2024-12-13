var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const eqSystems = data.trim().split('\n\n')
    .map(block => block.split('\n'))
    .map(lines => lines.map(line => [...line.matchAll(/\d+/g)].map(v => parseInt(v))))


// Part 1
function solveSystem([[x_a, y_a], [x_b, y_b], [X, Y]], testCoefficient) {
    console.log('');

    console.log(`${X} = ${x_a}a + ${x_b}b`)
    console.log(`${Y} = ${y_a}a + ${y_b}b`)
    // X = x_a * a + x_b * b
    // Y = y_a * a + y_b * b

    // Eliminate a and solve for b
    const b = ((y_a * X) - (x_a * Y)) / ((y_a * x_b) - (x_a * y_b));

    if (!testCoefficient(b)) return;

    const a = (X - (x_b * b)) / x_a
    if (!testCoefficient(a)) return;

    return [a, b];
}

function part1() {
    const valid = eqSystems.map(puzzle => solveSystem(puzzle, (c) => (c === Math.round(c) && c >= 0 && c <= 100)))
        .filter(solution => solution !== undefined);

    const score = valid.reduce((sum, [a,b]) => sum + (3*a + b) , 0);
    console.log(score);
}
part1()

// Part 2
function part2() {

    const valid = eqSystems.map(([a, b, [X, Y]]) => [a, b, [10_000_000_000_000 + X, 10000000000000 + Y]])
        .map(puzzle => solveSystem(puzzle, (c) => (c === Math.round(c))))
        .filter(solution => solution !== undefined);

    const score = valid.reduce((sum, [a,b]) => sum + (3*a + b) , 0);
    console.log(score);
}
part2()
