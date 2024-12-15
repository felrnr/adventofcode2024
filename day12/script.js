var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const rawMap = data.trim().split('\n').map(line => [...line.trim()]);
const dimensions = [rawMap.length, rawMap[0].length];
const isInBounds = ([y, x], [yMax, xMax]=dimensions) => (x >= 0 && x < xMax) && (y >= 0 && y < yMax);

const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const getFirstUnassignedTile = (areaMap) => {
    for (let y = 0; y < dimensions[0]; y++)
        for (let x = 0; x < dimensions[1]; x++)
            if (areaMap[y][x] === undefined) return [y, x];
    return null;
}

function fillArea(areaId, areaMap, rawMap, startTile) {
    let toExplore = [startTile];
    const plantType = rawMap[startTile[0]][startTile[1]];
    let area = {plantType, areaId, tiles: [startTile]};

    while (toExplore.length > 0) {
        const [y,x] = toExplore.pop()
        areaMap[y][x] = areaId;

        NEIGHBOURS
            .map(([dy, dx]) => [y + dy, x + dx])
            .filter((pos) => isInBounds(pos))
            .filter(([yn, xn]) => rawMap[yn][xn] === plantType)
            .filter(([yn, xn]) => areaMap[yn][xn] === undefined)
            .forEach(([yn, xn]) => {
                toExplore.push([yn, xn]);
                area.tiles.push([yn, xn]);
                areaMap[yn][xn] = areaId;
            });
    }

    return area;
}

function findAllAreas() {
    let areas = [];
    let areaMap = rawMap.map(row => row.slice().fill());

    while (true) {
        const tile = getFirstUnassignedTile(areaMap);
        if (tile === null) break;

        areas.push(fillArea(areas.length, areaMap, rawMap, tile));
    }

    return {areas, areaMap};
}

function calcPerimiter({areaId, tiles}) {
    const perimiters = tiles.map(([y,x]) => (
        NEIGHBOURS
            .map(([dy, dx]) => [y + dy, x + dx])
            .filter(([yn, xn]) => tiles.find(([y,x]) => (xn==x && yn==y)) === undefined) // neighbour tile not part of this area = fence.
            .length
        ));
    const totalPerimiter = perimiters.reduce((a, b) => a + b, 0);
    return totalPerimiter;
}

function part1() {
    const {areas} = findAllAreas(rawMap);

    const calcAreaCosts = (area) => area.tiles.length * calcPerimiter(area);
    const totalCosts = areas.reduce((sum, area) => sum + calcAreaCosts(area), 0);
    return totalCosts;
}

console.log(part1());

// Part 2
const isAdjacentFence = ([y1, x1, dy1, dx1], [y2, x2, dy2, dx2]) => {
    if (!(dy1 === dy2 && dx1 === dx2)) return false; // different orientation
    if (y1-dx1 === y2 && x1-dy1 === x2) return true; // Neighbour with same orientation
    if (y1+dx1 === y2 && x1+dy1 === x2) return true; // Neighbour with same orientation
    return false;
}

function calcFenceSegments({tiles}) {
    let singleSegments = tiles.flatMap(([y0, x0]) => (
        NEIGHBOURS
            .filter(([dy, dx]) => tiles.find(([y, x]) => ((x0 + dx) == x && (y0 + dy) == y)) === undefined) // neighbour tile not part of this area = fence.
            .map(([dy, dx]) => [y0, x0, dy, dx])
        ));

    // combine segments
    let combinedSegments = [];
    let currentSegment = [];
    while (singleSegments.length > 0) {
        if (currentSegment.length === 0) {
            currentSegment.push(singleSegments.pop());
        } else {
            // Extend current segment
            let adjacentIdx = singleSegments.findIndex((segment1) => currentSegment.some((segment2) => isAdjacentFence(segment1, segment2)));
            if (adjacentIdx !== -1) {
                const adjacentSegment = singleSegments.splice(adjacentIdx, 1)[0];
                currentSegment.push(adjacentSegment);
            } else {
                // Start new segment
                combinedSegments.push(currentSegment);
                currentSegment = [];
            }
        }
    }

    if (currentSegment.length > 0) combinedSegments.push(currentSegment);

    return combinedSegments;
}

function part2() {
    const {areas} = findAllAreas(rawMap);

    const calcAreaCosts = (area) => area.tiles.length * calcFenceSegments(area).length;
    const totalCosts = areas.reduce((sum, area) => sum + calcAreaCosts(area), 0);
    return totalCosts;
}

console.log(part2());
