const { Utils } = require('Utils');

const PASS = 'pass';
const UNASSIGNED = 'UNASSIGNED';
const NO_TURN = -1;
const REQUIRED_PLAYERS = 4;
const CARDS_PER_PLAYER = 8;
const TOTAL_ROUNDS = 8;
const MIN_REQUIRED_POINTS = 16;
const MAX_GAME_POINTS = 29;
const TRUMP_CARD_MULTIPLIER = 100;
const STATE_TRANSITION_TIME = 5000;
const BOT_TRANSITION_TIME = 1000;
const BOT_SESSION = "BOT_SESSION";

const Direction = {
    clockwise: 'clockwise',
    antiClockwise: 'antiClockwise'
};
const Teams = {
    teamA: 'teamA',
    teamB: 'teamB'
};
const Cards = [
    { name: 'jack', value: 3, level: 8 },
    { name: '9', value: 2, level: 7 },
    { name: 'ace', value: 1, level: 6 },
    { name: '10', value: 1, level: 5 },
    { name: 'king', value: 0, level: 4 },
    { name: 'queen', value: 0, level: 3 },
    { name: '8', value: 0, level: 2 },
    { name: '7', value: 0, level: 1 }
];
const CardTypes = [ 'diamonds', 'spades', 'clubs', 'hearts' ];
const generateCards = () => {
    var cards = [];
    var cardRank = 0;
    for (var type of CardTypes) {
        for (var card of Cards) {
            cardRank += 1;
            cards.push({
                name: card.name,
                value: card.value,
                score: (card.value + 1) * card.level, // 32, 21, 12, 10, 4, 5, 6, 1
                cardRank,
                type
            });
        }
    }
    return cards;
};
const attachCardIndices = cards => {
    var updatedCards = cards;
    var cardIndex = 0;
    for (var card of updatedCards) {
        card.cardIndex = cardIndex;
        cardIndex++;
    }
    return updatedCards;
};
const sortCardsByRank = cards => {
    return cards.sort((cardA, cardB) => cardA.cardRank - cardB.cardRank);
};
const getHighestScoreCardIndex = (cards, indices, excludeJ) => {
    var highestScore = 0;
    var highestScoreCardIndex = 0;
    cards.forEach((card, index) => {
        if (excludeJ && card.name === 'jack') {
            return;
        }
        if (card.score >= highestScore) {
            highestScore = card.score;
            highestScoreCardIndex = indices[index];
        }
    });
    return highestScoreCardIndex;
};
const getLowestScoreCardIndex = (cards, indices) => {
    var lowestScore = 100;
    var lowestScoreCardIndex = 0;
    cards.forEach((card, index) => {
        if (card.score <= lowestScore) {
            lowestScore = card.score;
            lowestScoreCardIndex = indices[index];
        }
    });
    return lowestScoreCardIndex;
};
const dealCards = (cards) => {
    const dealtCards = [];
    for (var i = 0; i < REQUIRED_PLAYERS; i++) {
        var playerCards = cards.splice(0, CARDS_PER_PLAYER);
        dealtCards.push(playerCards);
    };
    return dealtCards;
};
const playerTargets = () => {
    const playerTargets = [];
    for (var i = 0; i < REQUIRED_PLAYERS; i++) {
        playerTargets.push({
            requiredPoints: 0,
            hasPassed: false,
            minRequiredPoints: 16
        });
    }
    return playerTargets;
};
const getTeam = playerIndex => {
    return playerIndex % 2 === 0 ? Teams.teamA : Teams.teamB;
};
const nextPlayer = turn => {
    return (turn + 1) % REQUIRED_PLAYERS;
};
const prevPlayer = turn => {
    if (turn === 0) {
        return REQUIRED_PLAYERS - 1;
    }
    return (turn - 1) % REQUIRED_PLAYERS;
};
const nextNonPassedPlayer = (currentTurn, gameTarget, playerTargets) => {
    var nextTurn = nextPlayer(currentTurn);
    while (playerTargets[nextTurn].hasPassed || nextTurn === gameTarget.playerIndex) {
        nextTurn =  nextPlayer(nextTurn);
    }
    return nextTurn;
};
const prevNonPassedPlayer = (currentTurn, playerTargets) =>  {
    var previousTurn = prevPlayer(currentTurn);
    while (playerTargets[previousTurn].hasPassed) {
        previousTurn =  prevPlayer(previousTurn);
    }
    return previousTurn;
};
const isTargetSet = playerTargets => {
    const passedCount = playerTargets.reduce((counter, playerTarget) => {
        return counter + (playerTarget.hasPassed ? 1 : 0)
    }, 0);
    return passedCount === REQUIRED_PLAYERS - 1;
};
const nextTurnOnPass = (currentTurn, gameTarget, playerTargets) => {
    return nextNonPassedPlayer(currentTurn, gameTarget, playerTargets);
};
const nextTurnOnSet = (currentTurn, previousGameTarget) => {
    if (typeof previousGameTarget.playerIndex === 'undefined') {
        return nextPlayer(currentTurn);
    }
    return previousGameTarget.playerIndex;
};
const minRequiredPointsOnPass = gameTarget => {
    return gameTarget.requiredPoints + 1;
};
const minRequiredPointsOnSet = (currentTurn, previousGameTarget, updatedGameTarget, currentDirection) => {
    if (typeof previousGameTarget.playerIndex === 'undefined' || currentDirection === Direction.antiClockwise) {
        return updatedGameTarget.requiredPoints + 1;
    }
    return updatedGameTarget.requiredPoints;
};
const updateCardScores = (playedCard, trumpCard, previouslyPlayedCards) => {
    if (previouslyPlayedCards.length === 0) {
        return playedCard;
    }
    const firstCardType = previouslyPlayedCards[0].type;
    const trumpCardMultiplier = firstCardType === trumpCard.type ? 1 : TRUMP_CARD_MULTIPLIER;
    var updatedCard = playedCard;
    var updatedScore = playedCard.score;
    if (playedCard.type !== firstCardType) {
        if (trumpCard.isRevealed && playedCard.type === trumpCard.type) {
            updatedScore = trumpCardMultiplier * updatedScore;
        } else {
            updatedScore = 0;
        }
    }
    updatedCard.score = updatedScore;
    return updatedCard;
};
const canRevealTrump = dealtCards => {
    for (var dealtCard of dealtCards) {
        if (dealtCard.canPlay) {
            return false;
        }
    }
    return true;
};
const makeAllCardsPlayable = dealtCards => {
    return dealtCards.map(dealtCard => {
        var updatedCard = dealtCard;
        updatedCard.canPlay = true;
        return updatedCard;
    });
};
const makeAllCardsUnplayable = dealtCards => {
    return dealtCards.map(dealtCard => {
        var updatedCard = dealtCard;
        updatedCard.canPlay = false;
        return updatedCard;
    });
};
const updateCardPlayability = gameState => {
    var updatedState = gameState;
    var trumpCard = gameState.trumpCard;
    const previouslyPlayedCards = gameState.playedCards;
    if (!trumpCard.isSet) {
        return gameState;
    } 
    if (previouslyPlayedCards.length === 0) {
        updatedState.dealtCards = makeAllCardsPlayable(gameState.dealtCards);
        return updatedState;
    }
    const firstCardType = previouslyPlayedCards[0].type;
    var sameTypePlayableCardCount = 0;
    var updatedCards = gameState.dealtCards.map(dealtCard => {
        var updatedCard = dealtCard;
        if (dealtCard.type === firstCardType) {
            updatedCard.canPlay = true;
            sameTypePlayableCardCount += 1;
        }
        return updatedCard;
    });
    if (sameTypePlayableCardCount === 0) {
        trumpCard.canReveal = true;
        updatedState.trumpCard = trumpCard;
        updatedState.dealtCards = makeAllCardsPlayable(gameState.dealtCards);
        return updatedState;
    }
    updatedState.dealtCards = updatedCards;
    return updatedState;
};
const updateTrumpCardPlayability = (gameState, playerIndex) => {
    const trumpCard = gameState.trumpCard;
    if (!trumpCard.isRevealed || trumpCard.revealedBy !== playerIndex || trumpCard.revealedAfter !== gameState.completedRounds) {
        return gameState;
    }
    var trumpCardPlayableCardCount = 0;
    var updatedState = gameState;
    var updatedCards = makeAllCardsUnplayable(gameState.dealtCards);
    updatedCards = updatedCards.map(dealtCard => {
        var updatedCard = dealtCard;
        if (dealtCard.type === trumpCard.type) {
            updatedCard.canPlay = true;
            trumpCardPlayableCardCount += 1;
        }
        return updatedCard;
    });
    if (trumpCardPlayableCardCount === 0) {
        updatedState.dealtCards = makeAllCardsPlayable(gameState.dealtCards);
    }
    updatedState.dealtCards = updatedCards;
    return updatedState;
};
const updateCanForfeit = (gameState, playerIndex) => {
    if (!gameState.gameTarget.isSet || !gameState.trumpCard.isSet || gameState.turn != playerIndex) {
        return gameState;
    }
    const turn = gameState.turn;
    const playerTeam = getTeam(turn);
    const otherTeam = playerTeam === Teams.teamA ? Teams.teamB : Teams.teamA;
    if (gameState[playerTeam].acquiredPoints == 0 || gameState[otherTeam].acquiredPoints == 0) {
        return gameState;
    }
    var updatedState = gameState;
    updatedState.canForfeit =  true;
    
    return updatedState;
};
const newGameState = (players, dealtCards, teamAScore, teamBScore, startingTurn) => {
    return {
        players,
        dealtCards,
        startingTurn,
        turn: startingTurn,
        completedRounds: 0,
        teamA: {
            score: teamAScore,
            acquiredPoints: 0
        },
        teamB: {
            score: teamBScore,
            acquiredPoints: 0
        },
        gameTarget: {
            isSet: false,
            requiredPoints: MIN_REQUIRED_POINTS,
            direction: Direction.antiClockwise
        },
        trumpCard: {
            isSet: false,
            isRevealed: false,
            isRevealNotified: false
        },
        playerTargets: playerTargets(),
        playedCards: [],
        inactiveSessionIds: [],
        canForfeit: false
    };
};

class TwentyNine {
    async start(sessionIds, dispatch) {
        var players = Utils.shuffle(sessionIds);
        const botIds = Array(REQUIRED_PLAYERS - players.length).fill(BOT_SESSION);
        players.push(...botIds);
        
        const cards = Utils.shuffle(generateCards());
        const dealtCards = dealCards(cards);
        const newState = newGameState(players, dealtCards, 0, 0, 0);
        await dispatch(newState);
    }
    
    async restart(gameState, dispatch) {
        const players = gameState.players;
        const cards = Utils.shuffle(generateCards());
        const dealtCards = dealCards(cards);
        const teamAScore = gameState.teamA.score;
        const teamBScore = gameState.teamB.score;
        const startingTurn = nextPlayer(gameState.startingTurn);
        const refreshedState = newGameState(players, dealtCards, teamAScore, teamBScore, startingTurn);
        await dispatch(refreshedState);
    }
    
    filterGameState(gameState, sessionId) {
        const players = gameState.players;
        const playerIndex = players.indexOf(sessionId);
        var filteredState = gameState;
        var dealtCards = gameState.dealtCards[playerIndex];
        if (!gameState.trumpCard.isSet) {
            dealtCards = dealtCards.slice(0, CARDS_PER_PLAYER / 2);
        }
        dealtCards = attachCardIndices(dealtCards);
        dealtCards = sortCardsByRank(dealtCards);
        filteredState.dealtCards = dealtCards;
        if (playerIndex === gameState.turn) {
            filteredState = updateCardPlayability(gameState);
            filteredState = updateTrumpCardPlayability(gameState, playerIndex);
            filteredState = updateCanForfeit(gameState, playerIndex);
        }
        return {
            ...gameState,
            playerIndex,
            team: playerIndex % 2 === 0 ? Teams.teamA : Teams.teamB,
            isPlayerTurn: playerIndex === gameState.turn
        };
    }
    
    async handlePlayerPass(gameState, playerState, dispatch) {
        const turn = gameState.turn;
        const gameTarget = gameState.gameTarget;
        var updatedState = gameState;
        var playerTargets = gameState.playerTargets;
        playerTargets[turn].hasPassed = true;
        updatedState.playerTargets = playerTargets;
        if (isTargetSet(playerTargets)) {
            updatedState.gameTarget.isSet = true;
            updatedState.turn = gameTarget.playerIndex;
            await dispatch(updatedState);
            return;
        }
        const nextTurn = nextTurnOnPass(turn, gameTarget, playerTargets);
        updatedState.turn = nextTurn;
        const minRequiredPoints = minRequiredPointsOnPass(gameTarget);
        playerTargets[nextTurn].minRequiredPoints = minRequiredPoints;
        updatedState.playerTargets = playerTargets;
        updatedState.gameTarget.direction = Direction.clockwise;
        await dispatch(updatedState);
    }
    
    async handlePlayerPoints(gameState, playerState, dispatch) {
        const turn = gameState.turn;
        const gameTarget = gameState.gameTarget;
        var updatedState = gameState;
        var playerTargets = gameState.playerTargets;
        const requiredPoints = playerState.requiredPoints;
        playerTargets[turn].requiredPoints = requiredPoints;
        const nextTurn = nextTurnOnSet(turn, gameTarget);
        updatedState.turn = nextTurn;
        const updatedGameTarget = {
            playerIndex: turn,
            team: getTeam(turn),
            requiredPoints
        };
        const currentDirection = gameTarget.direction;
        updatedGameTarget.direction = currentDirection === Direction.clockwise ? Direction.antiClockwise : Direction.clockwise;
        updatedState.gameTarget = updatedGameTarget;
        const minRequiredPoints = minRequiredPointsOnSet(turn, gameTarget, updatedGameTarget, currentDirection);
        playerTargets[nextTurn].minRequiredPoints = minRequiredPoints;
        updatedState.playerTargets = playerTargets;
        await dispatch(updatedState);
    }
    
    async handleTargetSetterRound(gameState, playerState, dispatch) {
        if (playerState.hasPassed) {
            await this.handlePlayerPass(gameState, playerState, dispatch);
        } else if (playerState.requiredPoints) {
            await this.handlePlayerPoints(gameState, playerState, dispatch);
        }
    }
    
    async handleTrumpSetterRound(gameState, playerState, dispatch) {
        var updatedState = gameState;
        var trumpCard = gameState.trumpCard;
        trumpCard.isSet = true;
        trumpCard.type = playerState.trumpCardType;
        updatedState.trumpCard = trumpCard;
        await dispatch(updatedState);
    }
    
    async handleForfeit(gameState, dispatch) {
        var updatedState = gameState;
        const turn = gameState.turn;
        const gameTarget = gameState.gameTarget;
        const setterTeam = gameTarget.team;
        const playerTeam = getTeam(turn);
        const otherTeam = playerTeam === Teams.teamA ? Teams.teamB : Teams.teamA;
        const requiredPoints = gameTarget.requiredPoints;
        const acquiredPoints = gameState[setterTeam].acquiredPoints;
        const winnerTeam = otherTeam;
        const loserTeam = playerTeam;
        updatedState.gameWinner = {
            winnerTeam,
            requiredPoints,
            acquiredPoints,
            setterTeam
        };
        const winnerPoints = winnerTeam === setterTeam ? 1 : 0;
        const loserPoints = loserTeam === setterTeam ? -1 : 0;
        updatedState[winnerTeam].score += winnerPoints;
        updatedState[loserTeam].score += loserPoints;
        await dispatch(updatedState);
    }
    
    async handleGameWinner(gameState, dispatch) {
        var updatedState = gameState;
        const gameTarget = gameState.gameTarget;
        const setterTeam = gameTarget.team;
        const otherTeam = setterTeam === Teams.teamA ? Teams.teamB : Teams.teamA;
        const requiredPoints = gameTarget.requiredPoints;
        const acquiredPoints = gameState[setterTeam].acquiredPoints;
        const winnerTeam = acquiredPoints >= requiredPoints ? setterTeam : otherTeam;
        updatedState.gameWinner = {
            winnerTeam,
            requiredPoints,
            acquiredPoints,
            setterTeam
        };
        const winnerPoints = acquiredPoints === MAX_GAME_POINTS ? 2 : (winnerTeam === setterTeam ? 1 : -1);
        updatedState[setterTeam].score += winnerPoints;
        await dispatch(updatedState);
    }
    
    async handleWinner(gameState, dispatch) {
        var updatedState = gameState;
        const winner = gameState.playedCards.reduce((currentWinner, playedCard) => {
            var updatedWinner = currentWinner;
            updatedWinner.points += playedCard.value;
            if (playedCard.score > currentWinner.score) {
                updatedWinner.score = playedCard.score;
                updatedWinner.playerIndex = playedCard.playerIndex;
            }
            return updatedWinner;
        }, { score: 0, points: 0, playerIndex: null });
        updatedState.turn = winner.playerIndex;
        updatedState.completedRounds += 1;
        const team = getTeam(winner.playerIndex);
        updatedState[team].acquiredPoints += winner.points;
        updatedState.playedCards = [];
        if (updatedState.completedRounds === TOTAL_ROUNDS) {
            updatedState[team].acquiredPoints += 1;
            await this.handleGameWinner(gameState, dispatch);
        } else {
            await dispatch(updatedState);
        }
    }
    
    async handleCardPlay(gameState, playerState, dispatch) {
        const cardIndex = playerState.playedCardIndex;
        const turn = gameState.turn;
        var updatedState = gameState;
        var dealtPlayerCards = gameState.dealtCards[turn];
        var playedCard = dealtPlayerCards[cardIndex];
        dealtPlayerCards.splice(cardIndex, 1);
        var updatedPlayedCard = updateCardScores(playedCard, gameState.trumpCard, gameState.playedCards);
        updatedState.dealtCards[turn] = dealtPlayerCards;
        var playedCards = gameState.playedCards;
        playedCards.push({
            ...updatedPlayedCard,
            playerIndex: turn
        });
        updatedState.playedCards = playedCards;
        if (playedCards.length === REQUIRED_PLAYERS) {
            updatedState.turn = NO_TURN;
            await dispatch(updatedState);
            await Utils.sleep(STATE_TRANSITION_TIME);
            await this.handleWinner(updatedState, dispatch);
        } else {
            updatedState.turn = nextPlayer(turn);
            await dispatch(updatedState);
        }
    }
    
    async handleRevealTrump(gameState, dispatch) {
        var updatedState = gameState;
        updatedState.trumpCard.isRevealed = true;
        updatedState.trumpCard.revealedBy = gameState.turn;
        updatedState.trumpCard.revealedAfter = gameState.completedRounds;
        await dispatch(updatedState);
        updatedState.trumpCard.isRevealNotified = true;
        await Utils.sleep(STATE_TRANSITION_TIME);
        await dispatch(updatedState);
    }
    
    async handlePlayRounds(gameState, playerState, dispatch) {
        if (playerState.revealTrump) {
            await this.handleRevealTrump(gameState, dispatch);
        } else {
            await this.handleCardPlay(gameState, playerState, dispatch);
        }
    }
    
    async updateState(gameState, sessionId, playerState, dispatch) {
        const player = gameState.players[gameState.turn];
        if (sessionId !== player) {
            await dispatch(gameState);
        } else if (playerState.forfeit) {
            await this.handleForfeit(gameState, dispatch)
        } else if (!gameState.gameTarget.isSet) {
            await this.handleTargetSetterRound(gameState, playerState, dispatch);
        } else if (!gameState.trumpCard.isSet) {
            await this.handleTrumpSetterRound(gameState, playerState, dispatch);
        } else {
            await this.handlePlayRounds(gameState, playerState, dispatch);   
        }
    }
    
    async handlePlayerEntry(gameState, sessionId, dispatch) {
        var players = gameState.players;
        var inactiveSessionIds = gameState.inactiveSessionIds;
        if (players.includes(sessionId)) {
            const index = inactiveSessionIds.indexOf(sessionId);
            if (index > -1) {
                inactiveSessionIds.splice(index, 1);
            }
            await dispatch({
                ...gameState,
                inactiveSessionIds
            });
            return;
        }
        
        var inactiveSessionIds = gameState.inactiveSessionIds;
        for (var currentSessionId of players) {
            if (inactiveSessionIds.includes(currentSessionId)) {
                players[players.indexOf(currentSessionId)] = sessionId;
                break;
            }
        }
        await dispatch({
            ...gameState,
            players
        });
    }
    
    async handlePlayerExit(gameState, sessionId, dispatch) {
        var inactiveSessionIds = gameState.inactiveSessionIds;
        inactiveSessionIds.push(sessionId);
        await dispatch({
            ...gameState,
            inactiveSessionIds
        });
    }
    
    // ====== BOT LOGIC ======
    
    async handleBotPlay(gameState, dispatch) {
        const player = gameState.players[gameState.turn];
        if (player !== BOT_SESSION) {
            return;
        }
        
        if (gameState.trumpCard.isRevealed && !gameState.trumpCard.isRevealNotified) {
            return;
        }
        
        if (gameState.dealtCards[0].length == 0 && gameState.dealtCards[1].length == 0 && gameState.dealtCards[2].length == 0 && gameState.dealtCards[3].length == 0) {
            return
        }
        
        await Utils.sleep(BOT_TRANSITION_TIME);
        
        if (!gameState.gameTarget.isSet) {
            const botState = this.computeGameTargetState(gameState);
            await this.handleTargetSetterRound(gameState, botState, dispatch);
        } else if (!gameState.trumpCard.isSet) {
            const botState = this.computeTrumpSuiteState(gameState);
            await this.handleTrumpSetterRound(gameState, botState, dispatch);
        } else {
            const botState = this.computePlayRoundState(gameState);
            await this.handlePlayRounds(gameState, botState, dispatch);   
        }
    }
    
    computeGameTargetState(gameState) {
        var botState = {};
        
        const playerTarget = gameState.playerTargets[gameState.turn];
        
        if (!playerTarget.hasPassed && playerTarget.minRequiredPoints == MIN_REQUIRED_POINTS) { // If bots turn, start with minimum required points
            botState.requiredPoints = MIN_REQUIRED_POINTS;
        } else { // Calculate the card strength and decide what to do
            const botCards = gameState.dealtCards[gameState.turn].slice(0, CARDS_PER_PLAYER / 2);
            var totalScore = 0;
        
            botCards.forEach((card, index) => {
                totalScore = totalScore + card.score;
            })
            
            // Check if teammate is the one setting before raising target
            const teamMateIndex = (gameState.turn + 2) % REQUIRED_PLAYERS;
            const isTeamMateSetting = !gameState.playerTargets[teamMateIndex].hasPassed && gameState.playerTargets[teamMateIndex].requiredPoints > 0;
            const canOverrideSeventeen = Math.random() < 0.5; // Overrides 50% of times
            const canOverrideEighteen = Math.random() < 0.3; // Overrides 30% of times
            
            if (totalScore > 45 && playerTarget.minRequiredPoints <= 18 && !isTeamMateSetting) { // If score > 40, raise, with maximum target of 18
                if (!canOverrideEighteen) { // If teammate is setting and can't override teammate, pass
                    botState.hasPassed = true;
                } else { // Set the target
                    botState.requiredPoints = playerTarget.minRequiredPoints;
                }
                botState.requiredPoints = playerTarget.minRequiredPoints;
            } else if (totalScore > 30 && playerTarget.minRequiredPoints <= 17) { // If score > 40, raise, with maximum target of 17
                if (isTeamMateSetting && !canOverrideSeventeen) { // If teammate is setting and can't override teammate, pass
                    botState.hasPassed = true;
                } else { // Set the target
                    botState.requiredPoints = playerTarget.minRequiredPoints;
                }
            } else { // Else pass
                botState.hasPassed = true;
            }
        }
        
        return botState;
    }
    
    computeTrumpSuiteState(gameState) {
        var botState = {};
        
        // Always select suite with maximum score
        const botCards = gameState.dealtCards[gameState.turn].slice(0, CARDS_PER_PLAYER / 2);
        var maxSuite;
        var maxSuiteScore = 0;
        var typeToScoreMapping = {
            'diamonds': 0, 'spades': 0, 'clubs': 0, 'hearts': 0
        };
        botCards.forEach((card, index) => {
            typeToScoreMapping[card.type] = typeToScoreMapping[card.type] + card.score;
            
            if (typeToScoreMapping[card.type] > maxSuiteScore) {
                maxSuiteScore = typeToScoreMapping[card.type];
                maxSuite = card.type;
            }
        });
        
        botState.trumpCardType = maxSuite;
        
        return botState;        
    }
    
    computeWinnerIndex(playedCards) {
        const winner = playedCards.reduce((currentWinner, playedCard) => {
                var updatedWinner = currentWinner;
                updatedWinner.points += playedCard.value;
                if (playedCard.score > currentWinner.score) {
                    updatedWinner.score = playedCard.score;
                    updatedWinner.playerIndex = playedCard.playerIndex;
                }
                return updatedWinner;
            }, { score: 0, points: 0, playerIndex: null });
        return winner.playerIndex;
    }
    
    computePlayRoundState(gameState) {
        var botState = {};
        
        const botCards = gameState.dealtCards[gameState.turn];
        const botCardIndices = botCards.map((value, index) => index);
        
        const botsTurnFirst = gameState.playedCards.length == 0;
        
        if (botsTurnFirst) { // If bots turn, pick highest if Jack, else pick lowest
            const highestCardIndex = getHighestScoreCardIndex(botCards, botCardIndices, false); // (include jacks)
            const highestCard = botCards[highestCardIndex];
            
            // Check if highest card is a Jack
            const isHighestCardJack = highestCard.name === 'jack';
            
            if (isHighestCardJack) { // If highest card is a Jack, play that
                botState.playedCardIndex = highestCardIndex
            } else { // Else play lowest
                botState.playedCardIndex = getLowestScoreCardIndex(botCards, botCardIndices);
                // botState.playedCardIndex = Math.floor(Math.random() * botCards.length); 
            }
        } else { // Pick random from same suite (if exists), else always revel trump if needed
            const firstCardType = gameState.playedCards[0].type;
            
            // Check if team mate is winning
            const teamMateIndex = (gameState.turn + 2) % REQUIRED_PLAYERS;
            const isTeamMateWinning = teamMateIndex == this.computeWinnerIndex(gameState.playedCards);
            
            // Calculate same, trump, non-trump suites that bot has
            var sameSuiteCards = [];
            var sameSuiteCardIndices = [];
            var trumpSuiteCards = [];
            var trumpSuiteCardIndices = [];
            var nonTrumpSuiteCards = [];
            var nonTrumpSuiteCardIndices = [];
            botCards.forEach((card, index) => {
                if (card.type == firstCardType) {
                    sameSuiteCards.push(card);
                    sameSuiteCardIndices.push(index);
                } else if (card.type == gameState.trumpCard.type) {
                    trumpSuiteCards.push(card);
                    trumpSuiteCardIndices.push(index);
                } else {
                    nonTrumpSuiteCards.push(card);
                    nonTrumpSuiteCardIndices.push(index);
                }
            });
            
            if (sameSuiteCards.length == 0) { // Reveal trump if needed, else play ramdon trump / random card
                if (!gameState.trumpCard.isRevealed && !isTeamMateWinning) { // Reveal trump if teammate is not winning
                    botState.revealTrump = true;
                } else { // Play lowest trump if teammate not winning, else play smartly based on if trump is revealed or not
                    if (gameState.trumpCard.isRevealed && trumpSuiteCards.length > 0 && !isTeamMateWinning) { // Play trump card if teammate not winning
                        const highestTrumpSuiteCardIndex = getHighestScoreCardIndex(trumpSuiteCards, trumpSuiteCardIndices, false); // (include jacks)
                        const highestTrumpSuiteCard = botCards[highestTrumpSuiteCardIndex];
                        
                        const lowestTrumpSuiteCardIndex = getLowestScoreCardIndex(trumpSuiteCards, trumpSuiteCardIndices);
                        const lowestTrumpSuiteCard = botCards[lowestTrumpSuiteCardIndex];
                        
                        // Compute winner if lowest trump card is played
                        var winnerIndex = this.computeWinnerIndex([...gameState.playedCards, { ...lowestTrumpSuiteCard, playerIndex: gameState.turn}]);
                        if (winnerIndex == gameState.turn) { // Play lowest trump if can win with that
                            botState.playedCardIndex = lowestTrumpSuiteCardIndex;
                        } else { // See if bot can win with highest trump
                            // Compute winner if highest trump card is played
                            winnerIndex = this.computeWinnerIndex([...gameState.playedCards, { ...highestTrumpSuiteCard, playerIndex: gameState.turn}]);
                            if (winnerIndex == gameState.turn) { // Play highest trump if can win with that
                                botState.playedCardIndex = highestTrumpSuiteCardIndex;
                            } else { // Play lowest from all cards
                                if (nonTrumpSuiteCards.length > 0) { // Play lowest from non-trump card, if it exists
                                    botState.playedCardIndex = getLowestScoreCardIndex(nonTrumpSuiteCards, nonTrumpSuiteCardIndices);
                                } else { // Play lowest from all cards
                                    botState.playedCardIndex = getLowestScoreCardIndex(botCards, botCardIndices);
                                }
                            }
                        }
                        botState.playedCardIndex = getLowestScoreCardIndex(trumpSuiteCards, trumpSuiteCardIndices);
                    } else { // Pick highest from all cards if teammate winning, else play lowest
                        if (isTeamMateWinning) { // Play highest from non-trump cards (if they exist), else play trump
                            if (gameState.trumpCard.isRevealed) { // If trump card revealed, play accodingly
                                if (nonTrumpSuiteCards.length > 0) { // Play highest from non-trump card, if it exists
                                    botState.playedCardIndex = getHighestScoreCardIndex(nonTrumpSuiteCards, nonTrumpSuiteCardIndices, true); // (exclude jacks)
                                } else {
                                    botState.playedCardIndex = getHighestScoreCardIndex(trumpSuiteCards, trumpSuiteCardIndices, true); // (exclude jacks)
                                }
                            } else { // Play highest from all cards
                                botState.playedCardIndex = getHighestScoreCardIndex(botCards, botCardIndices, true); // (exclude jacks)
                            }
                        } else { // Play lowest from all cards
                            botState.playedCardIndex = getLowestScoreCardIndex(botCards, botCardIndices);
                        }
                    }
                }
            } else { // Pick highest from same suite if teammate winning, else play lowest
                if (isTeamMateWinning) { // Play highest
                    botState.playedCardIndex = getHighestScoreCardIndex(sameSuiteCards, sameSuiteCardIndices, true); // (exclude jacks)
                } else { // If can win with its card, play highest, else play lowest card
                    const highestSameSuiteCardIndex = getHighestScoreCardIndex(sameSuiteCards, sameSuiteCardIndices, false); // (include jacks)
                    const highestSameSuiteCard = botCards[highestSameSuiteCardIndex];
                    
                    // Compute winner if best card is played
                    const winnerIndex = this.computeWinnerIndex([...gameState.playedCards, { ...highestSameSuiteCard, playerIndex: gameState.turn}]);
                    
                    var canWinWithHighestSuiteCard = winnerIndex == gameState.turn;
                    
                    if (highestSameSuiteCard.name === 'jack') { // If highest suit card is jack, play it if bot can win with it
                        canWinWithHighestSuiteCard = canWinWithHighestSuiteCard && true;
                    } else if (highestSameSuiteCard.name === '9') { // If 9, play it if bot can win with it based on memory of if jack was played
                        // Compute the jacks that have been played already
                        var jacksPlayed = {
                            'diamonds': false, 'spades': false, 'clubs': false, 'hearts': false
                        };
                        gameState.dealtCards.forEach((playerCards, playerIndex) => {
                            if (playerIndex == gameState.turn) {
                                return
                            }
                            
                            playerCards.forEach((card, index) => {
                                if (card.name === 'jack') {
                                    jacksPlayed[card.type] = true;
                                }
                            });
                        });
                        
                        const memoryAccuracy = Math.random() < 0.85; // Remembers if Jack is played with 85% accuracy
                        const jackPlayedInSameSuite = jacksPlayed[highestSameSuiteCard.type] && memoryAccuracy;
                        
                        canWinWithHighestSuiteCard = canWinWithHighestSuiteCard && jackPlayedInSameSuite;
                    }
                    
                    if (canWinWithHighestSuiteCard) { // If can win with its highest card, play that 
                        botState.playedCardIndex = highestSameSuiteCardIndex;
                    } else { // Else play lowest card
                        botState.playedCardIndex = getLowestScoreCardIndex(sameSuiteCards, sameSuiteCardIndices);
                    }
                }
            }
        }
        
        return botState;
    }
}

module.exports.TwentyNine = new TwentyNine();
