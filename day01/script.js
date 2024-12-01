var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

let list1 = [];
let list2 = [];

data.split('\n')
    .map(row => row.trim().split(/\s+/))
    .forEach(([element1, element2]) => {
        list1.push(parseInt(element1));
        list2.push(parseInt(element2));
    });

list1.sort();
list2.sort();

// Part 1
const distance = list1.reduce((total, num1, idx) => total + Math.abs(num1 - list2[idx]), 0);
console.log(distance);

// Part 2
const occurrences = list2.reduce((ref, num) => {
    ref[num] = (ref[num] || 0) + 1;
    return ref;
}, {});

const similarity = list1.reduce((total, num) => total + num * (occurrences[num] || 0), 0)
console.log(similarity);
