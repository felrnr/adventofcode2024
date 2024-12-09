var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const instructions = data.trim().split('').map((d) => parseInt(d));


function calcCheckSum(iStart, iEnd, blockNum) {
  let checksum = 0;
  for (let i = iStart; i < iEnd; i++) {
    checksum += i * blockNum;
  }
//   console.log(`${iStart}-${iEnd} @${blockNum}: (${checksum})`)

  return checksum;
}

function part1() {
  let i = 0;
  let j = instructions.length - 1;
  let emptyBlocksRemaining = 0;
  let fileBlocksRemaining = instructions[j];
  let idx = 0;
  let checksum = 0;


  while(i < j) {
    if (i % 2 == 0) {
      // File space
      checksum += calcCheckSum(idx, idx + instructions[i], i / 2);
      idx += instructions[i];

      i++;
      emptyBlocksRemaining = instructions[i];
    } else if (i < j) {
      // Free space
      const blocksToMove = Math.min(emptyBlocksRemaining, fileBlocksRemaining)
      checksum += calcCheckSum(idx, idx + blocksToMove, j / 2);;

      emptyBlocksRemaining -= blocksToMove;
      fileBlocksRemaining -= blocksToMove;
      idx += blocksToMove;

      if (emptyBlocksRemaining == 0) i++;

      if (fileBlocksRemaining == 0) {
        j -= 2;
        fileBlocksRemaining = instructions[j];
      }
    }
  }

  if (fileBlocksRemaining > 0) checksum += calcCheckSum(idx, idx + fileBlocksRemaining, j / 2);

  return checksum;
}


console.log(part1())

// Part 2

// Map to tuples of [blockSize, fileId]. fileId = -1 for blank spaces.
let instructionBlocks = instructions.map((d, idx) => [d, (idx % 2 == 0) ? idx / 2 : -1]);

function reorderFiles() {
    let j = instructionBlocks.length-1;

    while (j > 0) {
        const addedFreeSpace = moveFile(j)
        if (!addedFreeSpace) j--
    }

    return instructionBlocks;
}

function moveFile(j) {
    if (instructionBlocks[j][1] == -1) return false;
    const [fileSize, fileId] = instructionBlocks[j];

    // First free space where this file fits.
    const insertionIdx = instructionBlocks.findIndex(([blockSize, fileId]) => fileId == -1 && blockSize >= fileSize);
    if (insertionIdx === -1 || insertionIdx > j) return false;

    instructionBlocks[j][1] = -1 // reclaim file location as free space

    const [freeSize] = instructionBlocks[insertionIdx];
    if (freeSize > fileSize)
        instructionBlocks.splice(insertionIdx + 1, 0, [freeSize - fileSize, -1]); // insert remaining free space.


    instructionBlocks[insertionIdx] = [fileSize, fileId];
    return (freeSize > fileSize);
}

function computeTotalChecksum() {
    let totalChecksum = 0;
    let idx = 0;
    instructionBlocks.forEach(([size, id]) => {
        if (id > -1) totalChecksum += calcCheckSum(idx, idx + size, id)
        idx += size;
    })
    return totalChecksum;
}

function part2() {
    reorderFiles();
    return computeTotalChecksum();
}
// console.log(instructionBlocks.map(([size, chr]) => String((chr >= 0) ? chr : '.').repeat(size)).join(''))

console.log(part2());
