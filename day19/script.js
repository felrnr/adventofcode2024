var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const {towels, patterns} = (() => {
    const [towelBlock, patternBlock] = data.split('\n\n');
    const towels = towelBlock.split(',').map(v => v.trim());
    const patterns = patternBlock.split('\n').map(v => v.trim());
    return {towels, patterns};
})();

// Part 1
let memo = {'': 1};
const calcArrangements = (towels, pattern) => (
    memo[pattern] ??= towels
        .filter(towel => pattern.startsWith(towel))
        .reduce((sum, towel) => sum + calcArrangements(towels, pattern.slice(towel.length)), 0)
);

const patternArrangements = patterns.map((pattern) => calcArrangements(towels, pattern));
const part1 = patternArrangements.filter(v => v > 0).length;
console.log(part1);

// part 2
const part2 = patternArrangements.reduce((a, b) => a + b, 0)
console.log(part2);
