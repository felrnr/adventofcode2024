var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const [rulesLines, manualLines] = data.split('\n\n');
const rules = rulesLines.split('\n')
    .map(line => line.trim().split('|').map(v => parseInt(v)));
const manuals = manualLines.split('\n')
    .map(line => line.split(',').map(v => parseInt(v)));

// Part 1
// Mapping of pages to their dependencies (pages that should NOT occur later)
const dependencies = rules.reduce((map, [l, r]) => ({...map, [r]: [...(map[r] || []), l]}), {});

function isCorrectOrder(manual) {
    let pagesSeen = new Set();

    for (let i = manual.length-1; i >= 0; i--) {
        const pageNr = manual[i];

        const isInvalid = dependencies[pageNr]?.some((depPageNr) => pagesSeen.has(depPageNr));
        if (isInvalid) return false;

        pagesSeen.add(pageNr);
    }

    return true;
}

const extractMiddlePage = (manual) => manual[(manual.length - 1) / 2];

const part1 = manuals
    .filter(isCorrectOrder)
    .reduce((sum, manual) => sum + extractMiddlePage(manual), 0);

console.log(part1);


// Part 2
const repairManualOrder = (manual) =>
    [...manual].sort((page1, page2) => {
        if (dependencies[page1]?.includes(page2)) return 1;
        if (dependencies[page2]?.includes(page1)) return -1;
        return 0;
    }
);

const part2 = manuals
    .filter(manual => !isCorrectOrder(manual))
    .map(repairManualOrder)
    .reduce((sum, manual) => sum + extractMiddlePage(manual), 0);

console.log(part2);
