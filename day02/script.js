var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const reports = data
    .split('\n')
    .map(line => line.trim().split(/\s+/).map(num => parseInt(num)))
;

// Part 1
function isSafe(levels, lowerBound, upperBound) {
    let isIncreasing = false;
    let isDecreasing = false;

    for (let i = 0; i < levels.length-1; i++) {
        const delta = levels[i+1] - levels[i];
        isIncreasing = isIncreasing || (delta > 0)
        isDecreasing = isDecreasing || (delta < 0)

        if (Math.abs(delta) < lowerBound || Math.abs(delta) > upperBound)
            return false;
    }

    return !(isIncreasing && isDecreasing);
}

console.log(reports.filter(report => isSafe(report, 1, 3)).length)


// Part 2
function isReportSafeInDirection(levels, direction, lowerBound, upperBound, allowRetry=false) {
    let deltas = levels
        .slice(0, levels.length-1)
        .map((lvl, idx) => levels[idx+1] - lvl);

    const isFaulty = (delta) => !(Math.abs(delta) >= lowerBound && Math.abs(delta) <= upperBound && Math.sign(delta) === direction);
    const firstUnsafeIdx = deltas.findIndex(isFaulty);

    if (firstUnsafeIdx == -1) return true;

    // Retry if allowed
    if (!allowRetry) return false;

    if (firstUnsafeIdx == 0) {
        if (isReportSafeInDirection(levels.slice(1), direction, lowerBound, upperBound, false))
            return true;
    }

    // Check right side of delta
    let retryLevels = levels.slice();
    retryLevels.splice(firstUnsafeIdx+1, 1);

    return isReportSafeInDirection(retryLevels, direction, lowerBound, upperBound, false)
}

function isReportSafe(levels, lowerBound, upperBound) {
    return [-1,1].some((direction) => isReportSafeInDirection(levels, direction, lowerBound, upperBound, true));
}

console.log(reports.filter(report => isReportSafe(report, 1, 3)).length);

