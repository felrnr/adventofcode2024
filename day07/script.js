var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

// equations: { target: Number, inputs: Number[] }[]
const equations = data.split('\n')
    .map(line => line.trim().split(':'))
    .map(([left, right]) => ({
        target: parseInt(left),
        inputs: right.trim().split(' ').map(v => parseInt(v))
    })
);

// Part 1
// function testEquation(target, current, [operand, ...rest], validOperations) {
//     if (operand === undefined) return (current === target);
//     if (current > target) return false;
//     return validOperations.some((op) => testEquation(target, op(current, operand), rest, validOperations))
// }
const testEquation = (target, current, [operand, ...rest], validOperations) => ((operand === undefined) ? (current === target) : ((current <= target) && validOperations.some((op) => testEquation(target, op(current, operand), rest, validOperations))))

const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

const solve = (operations) => equations
    .filter((eq) => testEquation(eq.target, 0, eq.inputs, operations))
    .reduce((sum, eq) => sum + eq.target, 0);

const part1 = solve([add, multiply]);
console.log(part1);

// Part 2
const concatenate = (a, b) => parseInt(String(a) + String(b));

const part2 = solve([add, multiply, concatenate]);
console.log(part2);
