var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

function handleInstructions(memory) {
    const mulExpressions = memory
        .match(/mul\(\d+,\d+\)/g)
        .map(expr => expr.match(/mul\((?<left>\d+),(?<right>\d+)\)/));

    const result = mulExpressions.reduce((total, match) => total + (match.groups.left * match.groups.right), 0)
    return result;
}

const p1Result = handleInstructions(data)
console.log(p1Result);


// Part 2
function cleanData(data) {
    let cleanParts = [];
    let isClean = true;
    let iStart = 0;

    while (true) {
        if (isClean) {
            // Find end of clean section
            const dontIdx = data.slice(iStart).indexOf("don't()")
            if (dontIdx == -1) {
                cleanParts.push(data.slice(iStart));
                break;
            }
            const iEnd = iStart + dontIdx;
            cleanParts.push(data.slice(iStart, iEnd))
            iStart = iEnd + 7;
            isClean = false;
        } else {
            // Find next clean section
            const doIdx = data.slice(iStart).indexOf("do()")
            if (doIdx == -1) break;

            iStart += doIdx + 4;
            isClean = true;
        }
    }

    return cleanParts;
}

let p2Result = cleanData(data)
    .map(part => handleInstructions(part))
    .reduce((a,b) => a+b, 0);

console.log(p2Result);

