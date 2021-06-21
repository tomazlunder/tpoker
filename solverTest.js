var Sol = require('./solver.js')

var solver = new Sol.Solver();
/*
var bla 
bla = solver.cardNumberToRank("2")
console.log(bla)

bla = solver.cardNumberToRank("A")
console.log(bla)
    
bla = solver.cardNumberToRank("K")
console.log(bla)
*/
var sol1
var cards 

a = solver.rankAndSuitToCardStr(10,0)
console.log(a)

cards = ["2d", "2h", "Qh", "10h", "Ah", "Kh", "Jh"]
console.log("TEST: " + cards)
sol1 = solver.solveHand(cards)
console.log(sol1.toString())
console.log(sol1.getHandName())
console.log("")

cards = ["2d", "2h", "2c", "2s", "Ah", "Kh", "Jh"]
console.log("TEST: " + cards)
sol1 = solver.solveHand(cards)
console.log(sol1.toString())
console.log("")

cards = ["2d", "2h", "2c", "2s", "Ah", "Kh", "Jh"]
console.log("TEST: " + cards)
sol1 = solver.solveHand(cards)
console.log(sol1.toString())
console.log("")

cards = ["2d", "2h", "2c", "3s", "3c", "Kh", "Jh"]
console.log("TEST: " + cards)
sol1 = solver.solveHand(cards)
console.log(sol1.toString())
console.log("")

cards = ["2d", "2h", "3s", "6s", "7s", "9s", "10s"]
console.log("TEST: " + cards)
sol1 = solver.solveHand(cards)
console.log(sol1.toString())
console.log("")

cards = ["2d", "2h", "2s", "Ks", "7c", "9d", "10d"]
console.log("TEST: " + cards)
sol1 = solver.solveHand(cards)
console.log(sol1.toString())
console.log("")

cards = ["2d", "2h", "3s", "3d", "7c", "9s", "10d"]
console.log("TEST: " + cards)
sol1 = solver.solveHand(cards)
console.log(sol1.toString())
console.log("")

cards = ["2d", "2h", "4s", "Kd", "7c", "9s", "10d"]
console.log("TEST: " + cards)
sol1 = solver.solveHand(cards)
console.log(sol1.toString())
console.log("")

cards = ["2d", "3h", "4s", "6d", "7c", "8s", "10d"]
console.log("TEST: " + cards)
sol1 = solver.solveHand(cards)
console.log(sol1.toString())
console.log("")


