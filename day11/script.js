var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const initialStones = data.trim().split(' ').map(v => parseInt(v));

// Part 1
const applyRules = (stone) => {
    if (stone == 0) return [1];
    const sStone = String(stone);
    if (sStone.length % 2 === 0) {
        const splitIdx = sStone.length / 2;
        return [sStone.substring(0, splitIdx), sStone.substring(splitIdx)].map(v => parseInt(v));
    }
    return [stone * 2024];
}

const blink = (inputStones) => inputStones.flatMap(applyRules);
const simulate = (inputStones, blinks) => {
    for (let i = 0; i < blinks; i++) inputStones = blink(inputStones);
    return inputStones;
};

const part1 = simulate(initialStones, 25).length
console.log(part1);


// Part 2
const memo = {};
const memoizedSimulate = (inputStone, blinks) => (
    memo[[inputStone, blinks].toString()] ??=
        (blinks == 1)
        ? applyRules(inputStone).length // Final step
        : applyRules(inputStone) // Recursion step
            .reduce((sum, stone) => sum + memoizedSimulate(stone, blinks-1), 0)
);

const part2 = initialStones.reduce((stoneCount, stone) => stoneCount + memoizedSimulate(stone, 75), 0);
console.log(part2);
