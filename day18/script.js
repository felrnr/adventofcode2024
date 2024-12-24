var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const N = 71;

const TileType = {
    FREE: '.',
    WALL: '#',
}

const generateBoard = (size=N) => Array(size).fill(0).map(() => Array(size).fill(TileType.FREE));
const coords = data.trim().split('\n').map(line => line.trim().split(',').map(v => parseInt(v)));
const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function bfs(board, start, [y_end, x_end]) {
    let frontier = [start];
    let parents = { [start.toString()]: null };

    while (frontier.length > 0) {
        let [y, x] = frontier.shift();
        if (y === y_end && x === x_end) break;

        directions.map(([dy, dx]) => [y+dy, x+dx])
            .filter(([yn, xn]) => (0 <= yn && yn < N && 0 <= xn && xn < N) )
            .filter(([yn, xn]) => (board[yn][xn] !== TileType.WALL) )
            .forEach(([yn, xn]) => {
                const nKey = [yn, xn].toString();
                if (nKey in parents) return;
                frontier.push([yn, xn]);
                parents[nKey] = [y,x].toString()
            });
    }

    return parents;
}

function route(toNode, parents) {
    let path = [];
    let curNode = toNode;
    while (curNode in parents) {
        path.push(curNode);
        curNode = parents[curNode];
    }
    return path;
}

function part1() {
    let board = generateBoard();
    coords.slice(0, 1024).forEach(([x,y]) => board[y][x] = TileType.WALL);
    const parents = bfs(board, [0, 0], [N-1, N-1]);

    const path = route([N-1, N-1], parents)
    console.log(path.length-1);
}
part1();


// Part 2
function part2() {
    let L = 0, M, R = coords.length-1;
    while (L < R) {
        M = Math.floor((L + R) / 2);
        let board = generateBoard();
        coords.slice(0, M).forEach(([x,y]) => board[y][x] = TileType.WALL);

        const parents = bfs(board, [0,0], [N-1, N-1]);
        if (parents[[N-1, N-1].toString()] === undefined) {
            R = M;
        } else {
            L = M + 1;
        }
    }
    console.log(coords[M].toString());
}
part2();
