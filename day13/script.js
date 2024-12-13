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

    // Eliminate a and solve for b
    // y_a * X - x_a * Y -> eliminates a
    const b = ((y_a * X) - (x_a * Y)) / ((y_a * x_b) - (x_a * y_b));
    if (!testCoefficient(b)) return;

    const a = (X - (x_b * b)) / x_a
    if (!testCoefficient(a)) return;

    return [a, b];
}

const calcCoins = (systems, testCoefficient) => (
    systems
        .map(puzzle => solveSystem(puzzle, testCoefficient))
        .filter(solution => solution !== undefined)
        .reduce((sum, [a,b]) => sum + (3*a + b) , 0)
);

const part1 = calcCoins(eqSystems, (c) => (c === Math.round(c) && c >= 0 && c <= 100));
console.log(part1);


// Part 2
const part2 = calcCoins(
    eqSystems.map(([a, b, [X, Y]]) => [a, b, [1e13 + X, 1e13 + Y]]),
    (c) => (c === Math.round(c))
)
console.log(part2);
