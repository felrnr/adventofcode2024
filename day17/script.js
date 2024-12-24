var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const loadData = () => (data.split('\n\n').map(block => [...block.matchAll(/\d+/g)].map(v => parseInt(v))));

// Part 1
function run(registers, program) {
    let pointer = 0;
    let outputs = [];
    let ops = [
        (l, c) => registers[0] >>= c, // adv
        (l, c) => registers[1] ^= l, // bxl
        (l, c) => registers[1] = c % 8, // bst
        (l, c) => (pointer = (registers[0] === 0) ? pointer : l), // jnz
        (l, c) => registers[1] ^= registers[2], // bxc
        (l, c) => outputs.push(c % 8), // out
        (l, c) => registers[1] = registers[0] >> c, // bdv
        (l, c) => registers[2] = registers[0] >> c, // cdv
    ];

    while (pointer+1 < program.length) {
        const opcode = program[pointer];
        const literal = program[pointer+1];
        const combo = (literal < 4) ? literal : registers[literal-4];

        pointer += 2;
        ops[opcode](literal, combo);
    }

    return outputs;
}

function part1() {
    const [registers, program] = loadData();
    const outputs = run(registers, program);

    console.log(outputs.join(','));
}
part1();
