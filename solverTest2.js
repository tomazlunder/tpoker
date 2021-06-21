var Sol = require('./solver.js')

var solver = new Sol.Solver();

var hands = [];

hands.push(["2d", "2h", "4s", "Kd", "7c", "9s", "10d"]);
hands.push(["2d", "2h", "2s", "Ks", "7c", "9d", "10d"]);
hands.push(["2d", "2h", "2c", "3s", "3c", "Kh", "Jh"]);
hands.push(["2d", "2h", "2c", "2s", "Ah", "Kh", "Jh"]);
hands.push(["2d", "2h", "Qh", "10h", "Ah", "Kh", "Jh"]);
hands.push(["2d", "2h", "8s", "4s", "5s", "6s", "7s"]);
hands.push(["2d", "2h", "3s", "6s", "7s", "9s", "10s"]);
hands.push(["2d", "2h", "3s", "3d", "7c", "9s", "10d"]);
hands.push(["2d", "3h", "4s", "6d", "7c", "8s", "10d"]);

var solvedHands = []

for(var i in hands){
    solvedHands.push(solver.solveHand(hands[i]))
}

for(var i in solvedHands){
    console.log(solvedHands[i].toString())
}
console.log("sorting")

var getWinners = solver.returnWinners(solvedHands)
for(var i in getWinners){
    console.log(getWinners[i].toString())
}

/*
console.log("sorting")
solved = solved.sort(solver.compareHands)

for(var i in solved){
    console.log(solved[i].toString())
}
*/
