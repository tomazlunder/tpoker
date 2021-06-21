class Solver {
    constructor(){
        this.suits = ["h", "d", "c", "s"]


    }

    solveHand(cards) {
        //Creates a card matrix
        var cardM = this.cardMatrixFromCards(cards);

        //console.log(cardM)

        var cardsInSolution = []

        //Royal flush
        console.log("Royal flush test")
        for(i in this.suits){
            if(cardM[i][12] && cardM[i][11] && cardM[i][10] && cardM[i][9] && cardM[i][8]){                
                cardsInSolution.push("A" + this.suits[i])
                cardsInSolution.push("K" + this.suits[i])
                cardsInSolution.push("Q" + this.suits[i])
                cardsInSolution.push("J" + this.suits[i])
                cardsInSolution.push("10" + this.suits[i])

                return new SolvedHand(cardsInSolution, [8]);
            }
        }

        //Straight flush
        console.log("Straight flush test")
        for(i in this.suits){
            var startingIndex = 12;
            
            while(startingIndex >= 3){
                if(startingIndex == 3){
                    if(cardM[i][3] && cardM[i][2] && cardM[i][1] && cardM[i][0] && cardM[i][12]){

                        cardsInSolution.push(this.rankAndSuitToCardStr(3, i))
                        cardsInSolution.push(this.rankAndSuitToCardStr(2, i))
                        cardsInSolution.push(this.rankAndSuitToCardStr(1, i))
                        cardsInSolution.push(this.rankAndSuitToCardStr(0, i))
                        cardsInSolution.push(this.rankAndSuitToCardStr(12, i))

                        return new SolvedHand(cardsInSolution, [7, startingIndex]);
                    }
                }

                else if(cardM[i][startingIndex] && cardM[i][startingIndex - 1] && cardM[i][startingIndex - 2] && cardM[i][startingIndex -3] && cardM[i][startingIndex -4]){

                    cardsInSolution.push(this.rankAndSuitToCardStr(startingIndex, i))
                    cardsInSolution.push(this.rankAndSuitToCardStr(startingIndex-1, i))
                    cardsInSolution.push(this.rankAndSuitToCardStr(startingIndex-2, i))
                    cardsInSolution.push(this.rankAndSuitToCardStr(startingIndex-3, i))
                    cardsInSolution.push(this.rankAndSuitToCardStr(startingIndex-4, i))

                    return new SolvedHand(cardsInSolution, [7, startingIndex]);

                }
                startingIndex--;
            }
        }

        //Four of a kind 
        console.log("Four of a kind test")
        for(var i = 12; i >= 0; i--){
            if(cardM[0][i] && cardM[1][i] && cardM[2][i] &&cardM[3][i]){
                cardsInSolution.push(this.rankAndSuitToCardStr(i, 0))
                cardsInSolution.push(this.rankAndSuitToCardStr(i, 1))
                cardsInSolution.push(this.rankAndSuitToCardStr(i, 2))
                cardsInSolution.push(this.rankAndSuitToCardStr(i, 3))

                cardM[0][i] = 0;
                cardM[1][i] = 0;
                cardM[2][i] = 0;
                cardM[3][i] = 0;

                var highCard = this.getHigh(cardM)
                cardsInSolution.push(highCard)


                return new SolvedHand(cardsInSolution, [6, i, this.cardStrToRank(highCard)])

            }
        }

        //Full house
        console.log("Full house test")

        var tempMat = this.cloneMatrix(cardM);

        var sum = 0;
        for(var i = 12; i >= 0; i--){
            sum = tempMat[0][i] + tempMat[1][i]  + tempMat[2][i]  + tempMat[3][i]
            
            if(sum == 3){
                if(tempMat[0][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,0))}
                if(tempMat[1][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,1))}
                if(tempMat[2][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,2))}
                if(tempMat[3][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,3))}

                tempMat[0][i] = 0;
                tempMat[1][i] = 0;
                tempMat[2][i] = 0;
                tempMat[3][i] = 0;

                var sum2 = 0;
                for(var j = 12; j >= 0; j--){
                    sum2 = tempMat[0][j] + tempMat[1][j]  + tempMat[2][j]  + tempMat[3][j]

                    if(sum2 == 2){
                        if(tempMat[0][j]){cardsInSolution.push(this.rankAndSuitToCardStr(j,0))}
                        if(tempMat[1][j]){cardsInSolution.push(this.rankAndSuitToCardStr(j,1))}
                        if(tempMat[2][j]){cardsInSolution.push(this.rankAndSuitToCardStr(j,2))}
                        if(tempMat[3][j]){cardsInSolution.push(this.rankAndSuitToCardStr(j,3))}
                        

                        return new SolvedHand(cardsInSolution, [5, i, j])
                    }

                }
            }
        }
        cardsInSolution = []

        //Flush
        console.log("Flush test")
        for(var s in this.suits){
            var sum =   cardM[s].reduce((a, b) => a + b, 0)
            var high = null;
            if(sum >= 5){
                for(var i = 12; i >= 0; i--){
                    if(cardM[s][i] == 1){
                        if(high == null){
                            high = i;
                        }
                        cardsInSolution.push(this.rankAndSuitToCardStr(i,s))
                        if(cardsInSolution.length == 5){
                            return new SolvedHand(cardsInSolution, [4, high])
                        }
                    }
                }
            }

        }

        //Three of a kind
        console.log("Three of a kind test")

        var tempMat = this.cloneMatrix(cardM);

        var sum = 0;
        for(var i = 12; i >= 0; i--){
            sum = tempMat[0][i] + tempMat[1][i]  + tempMat[2][i]  + tempMat[3][i]
            
            if(sum == 3){
                if(tempMat[0][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,0))}
                if(tempMat[1][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,1))}
                if(tempMat[2][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,2))}
                if(tempMat[3][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,3))}

                tempMat[0][i] = 0;
                tempMat[1][i] = 0;
                tempMat[2][i] = 0;
                tempMat[3][i] = 0;

                high = this.getHigh(tempMat)
                cardsInSolution.push(high)

                high2 = this.getHigh(tempMat)
                cardsInSolution.push(high2)

                return new SolvedHand(cardsInSolution, [3, this.cardStrToRank(high)])
            }
        }
        cardsInSolution = []

        //Two pairs (and single pair...)
        console.log("Two pair and single pair test")
        var tempMat = this.cloneMatrix(cardM);

        var sum = 0;
        for(var i = 12; i >= 0; i--){
            sum = tempMat[0][i] + tempMat[1][i]  + tempMat[2][i]  + tempMat[3][i]
            
            if(sum == 2){
                if(tempMat[0][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,0))}
                if(tempMat[1][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,1))}
                if(tempMat[2][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,2))}
                if(tempMat[3][i]){cardsInSolution.push(this.rankAndSuitToCardStr(i,3))}

                tempMat[0][i] = 0;
                tempMat[1][i] = 0;
                tempMat[2][i] = 0;
                tempMat[3][i] = 0;

                var sum2 = 0;
                for(var j = 12; j >= 0; j--){
                    sum2 = tempMat[0][j] + tempMat[1][j]  + tempMat[2][j]  + tempMat[3][j]

                    if(sum2 == 2){
                        if(tempMat[0][j]){cardsInSolution.push(this.rankAndSuitToCardStr(j,0))}
                        if(tempMat[1][j]){cardsInSolution.push(this.rankAndSuitToCardStr(j,1))}
                        if(tempMat[2][j]){cardsInSolution.push(this.rankAndSuitToCardStr(j,2))}
                        if(tempMat[3][j]){cardsInSolution.push(this.rankAndSuitToCardStr(j,3))}

                        tempMat[0][j] = 0;
                        tempMat[1][j] = 0;
                        tempMat[2][j] = 0;
                        tempMat[3][j] = 0;

                        var high = this.getHigh(tempMat)
                        cardsInSolution.push(high)
                        
                        return new SolvedHand(cardsInSolution, [2, i, j, this.cardStrToRank(high)])
                    }
                }

                //Single pair

                var high1 = this.getHigh(tempMat)
                cardsInSolution.push(high1)

                var high2 = this.getHigh(tempMat)
                cardsInSolution.push(high2)

                var high3 = this.getHigh(tempMat)
                cardsInSolution.push(high3)

                return new SolvedHand(cardsInSolution, [1, i, this.cardStrToRank(high1)])

            }
        }
        cardsInSolution = []

        //High card
        console.log("High card")
        var high1 = this.getHigh(tempMat)
        cardsInSolution.push(high1)

        var high2 = this.getHigh(tempMat)
        cardsInSolution.push(high2)

        var high3 = this.getHigh(tempMat)
        cardsInSolution.push(high3) 

        var high4 = this.getHigh(tempMat)
        cardsInSolution.push(high4) 

        var high5 = this.getHigh(tempMat)
        cardsInSolution.push(high5)
        
        return new SolvedHand(cardsInSolution, [0, this.cardStrToRank(high1)])
    }

    getHigh(matrix){
        for(var i = 12; i >= 0; i--){
            for(var j in this.suits){
                if(matrix[j][i] == 1){
                    matrix[j][i] = 0;
                    return this.rankAndSuitToCardStr(i,j);
                }
            }
        }
    }

    //Creates a card martix
    //Hearts ... 2,3,4,..,K,A
    //Diamonds
    //Clubs
    //Spades
    cardMatrixFromCards(cards) {
        var cardMatrix = []
        cardMatrix[0] = (new Array(13).fill(0))
        cardMatrix[1] = (new Array(13).fill(0))
        cardMatrix[2] = (new Array(13).fill(0))
        cardMatrix[3] = (new Array(13).fill(0))

        
        for(var i in cards){
            var card = cards[i]
            var number
            var suit 
            if(card.length == 2){
                number = card.charAt(0)
                suit = card.charAt(1)
            } else if (card.length == 3){
                number = card.substring(0,2);
                suit = card.charAt(2)
            }
            //console.log(this.cardNumberToRank(number))

            if(suit == "h"){
                cardMatrix[0][this.cardNumberToRank(number)] = 1
            }
            if(suit == "d"){
                cardMatrix[1][this.cardNumberToRank(number)] = 1
            }
            else if (suit == "c"){
                cardMatrix[2][this.cardNumberToRank(number)] = 1
            }
            else if (suit == "s"){
                cardMatrix[3][this.cardNumberToRank(number)] = 1
            }
        }

        return cardMatrix;
    }

    //2..A => 0..12
    cardNumberToRank(number){
        var rank
        if(/^\+?\d+$/.test(number)){
            rank  = parseInt(number) - 2;

        } else if(number == "J"){
            rank = 9
        }
        else if(number == "Q"){
            rank = 10
        }
        else if(number == "K"){
            rank = 11
        }
        else if(number == "A"){
            rank = 12
        }
        return rank; 
    }

    //0..12 => "2..A"
    rankToCardNumber(rank){
        var card
        if(rank <= 8){
            card = String(rank + 2)
        }
        else if (rank == 9){
            card = "J"
        }
        else if (rank == 10){
            card = "Q"
        }
        else if (rank == 11){
            card = "K"
        }
        else if (rank == 12){
            card = "A"
        }

        return card
    }

    //[0-12],[0-3] => Ah
    rankAndSuitToCardStr(rank, suit){
        var s = null;
        if(suit == 0){
            s = "h"
        }
        else if (suit == 1){
            s = "d"
        }
        else if (suit == 2){
            s = "c"
        }
        else if (suit == 3){
            s = "s"
        }

        return this.rankToCardNumber(rank) + s 
    }

    //"Ah" => 12
    cardStrToRank(card){
        var number
        var suit
        //console.log(card)
        //console.log(card.length)
        if(card.length == 2){
            number = card.charAt(0)
            suit = card.charAt(1)
        } else if (card.length == 3){
            number = card.substring(0,2);
            suit = card.charAt(2)
        }
        //console.log(number)
        //console.log(suit)
        return this.cardNumberToRank(number)
    }

    //Clones the matrix
    cloneMatrix(mat){
        var newArray = [];

        for (var i = 0; i < mat.length; i++){
            newArray[i] = mat[i].slice();
        }

        return newArray;
    }

    compareHands(hand1, hand2) {
        var toCompare1
        var toCompare2
        for(var i = 0; i<4; i++){
            toCompare1 = hand1.hand[i]
            toCompare2 = hand2.hand[i]
    
            if(toCompare1 == null || toCompare2 == null){
                return 0;
            }
    
            if(toCompare1 === toCompare2){
                continue;
            }
            else if(toCompare1 > toCompare2){
                return -1;
            }
            else if(toCompare2 > toCompare1){
                return 1;
            }
    
        }
    }

    returnWinners(hands){
        var solved = hands.sort(this.compareHands)
        var winners = []
        winners.push(solved[0])
        for(var i in solved){
            if(solved[i+1] != null){
                if(this.compareHands(solved[i], solved[i+1]) == 0){
                    winners.push(solved[i+1])
                }
                else{
                    break;
                }
            }
        }

        return winners;
    }
}

class SolvedHand{
    constructor(cards, hand){
        this.cards = cards;
        this.hand = hand;
    }

    toString() {
        var handName;
        handName = this.getHandName()

        var toRet = String(this.cards) +" | " + handName + " | "
        for(var i = 0; i < this.hand.length; i++){
            toRet += this.hand[i] + " "
        }

        return toRet
    }

    getHandName(){
        var handName;
        if(this.hand[0] == 8){
            handName = "ROYAL FLUSH"
        } 
        else if (this.hand[0] == 7){
            handName = "STRAIGHT FLUSH"
        }
        else if (this.hand[0] == 6){
            handName = "FOUR OF A KIND"
        }
        else if (this.hand[0] == 5){
            handName = "FULL HOUSE"
        }
        else if (this.hand[0] == 4){
            handName = "FLUSH"
        }
        else if (this.hand[0] == 3){
            handName = "THREE OF A KIND"
        }
        else if (this.hand[0] == 2){
            handName = "TWO PAIRS"
        }
        else if (this.hand[0] == 1){
            handName = "PAIR"
        }
        else if (this.hand[0] == 0){
            handName = "HIGH"
        }
        return handName;
    }
    
}

exports.Solver = Solver;
exports.SolvedHand = SolvedHand;