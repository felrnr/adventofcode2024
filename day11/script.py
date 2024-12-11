with open('day11/input.txt', 'r') as f:
    data = f.read()

initialStones = [int(v) for v in data.strip().split(' ')]

# Part 1
def applyRules(stone):
    if (stone == 0): return [1]
    sStone = str(stone)
    if (len(sStone) % 2 == 0):
        splitIdx = len(sStone) // 2
        return [int(sStone[0:splitIdx]), int(sStone[splitIdx:])]
    return [stone * 2024]

def blink(inputStones):
    return [
        outputStone
        for stone in inputStones
        for outputStone in applyRules(stone)
    ]

def simulate(inputStones, blinks):
    for _ in range(blinks):
        inputStones = blink(inputStones)
    return inputStones

part1 = len(simulate(initialStones, 25))
print(f"\nPart 1: {part1}")

# Part 2
memo = dict()
def memoizedSimulate(inputStone, blinks):
    if (inputStone, blinks) in memo:
        return memo[(inputStone, blinks)]

    if blinks == 1: # Final step
        memo[(inputStone, blinks)] = len(applyRules(inputStone))
    else: # Recursion step
        memo[(inputStone, blinks)] = sum([memoizedSimulate(stone, blinks-1) for stone in applyRules(inputStone)])

    return memo[(inputStone, blinks)]

part2 = sum([memoizedSimulate(stone, 75) for stone in initialStones])
print(f"\nPart 2: {part2}")
