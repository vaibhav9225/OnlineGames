const { Utils } = require('Utils');

const STATE_TRANSITION_TIME = 3000;
const ROW1 = Utils.shuffle([
    "1_b:4_r",
    "0_b:1_w,2_g,2_r",
    "1_p:4_b",
    "0_p:2_g,1_r",
    "0_p:2_w,2_b,1_r",
    "0_w:3_w,1_b,1_p",
    "0_r:1_w,1_b,1_g,1_p",
    "0_w:2_r,1_p",
    "0_p:1_g,3_r,1_p",
    "0_w:1_b,1_g,1_r,1_p",
    "0_p:1_w,2_b,1_g,1_r",
    "1_w:4_g",
    "0_g:1_w,3_b,1_g",
    "0_g:1_b,2_r,2_p",
    "0_r:3_w",
    "0_b:1_w,1_g,2_r,1_p",
    "0_b:3_p",
    "0_g:2_b,2_r",
    "0_w:1_b,2_g,1_r,1_p",
    "0_r:2_w,1_b,1_g,1_p",
    "0_p:3_g",
    "0_r:2_w,1_g,2_p",
    "0_w:2_b,2_g,1_p",
    "0_b:1_b,3_g,1_r",
    "0_b:2_g,2_p",
    "0_b:1_w,2_p",
    "0_g:3_r",
    "0_g:2_w,1_b",
    "0_g:1_w,1_b,1_r,1_p",
    "0_w:2_b,2_p",
    "0_b:1_w,1_g,1_r,1_p",
    "1_r:4_w",
    "0_p:2_w,2_g",
    "1_g:4_p",
    "0_p:1_w,1_b,1_g,1_r",
    "0_w:3_b",
    "0_g:1_w,1_b,1_r,2_p",
    "0_r:1_w,1_r,3_p",
    "0_r:2_b,1_g"
]);
const ROW2 = Utils.shuffle([
    "2_w:1_g,4_r,2_p",
    "1_p:3_w,2_b,2_g",
    "1_b:2_b,2_g,3_r",
    "3_g:6_g",
    "2_g:5_b,3_g",
    "3_r:6_r",
    "1_w:2_w,3_b,3_r",
    "2_b:5_b",
    "1_g:3_w,2_g,3_r",
    "2_g:5_g",
    "2_w:5_r",
    "2_w:5_r,3_p",
    "1_r:3_b,2_r,3_p",
    "2_b:5_w,3_b",
    "1_g:2_w,3_b,2_p",
    "2_p:5_w",
    "1_p:3_w,3_g,2_p",
    "3_p:6_p",
    "1_w:3_g,2_r,2_p",
    "2_r:1_w,4_b,2_g",
    "1_r:2_w,2_r,3_p",
    "1_b:2_b,3_g,3_p",
    "0_r:2_w,2_r",
    "2_g:4_w,2_b,1_p",
    "2_b:2_w,1_r,4_p",
    "2_p:5_g,3_r",
    "3_b:6_b",
    "2_p:1_b,4_g,2_r",
    "2_r:5_p",
    "3_w:6_w",
    "2_r:3_w,5_p"
]);
const ROW3 = Utils.shuffle([
    "4_p:3_g,6_r,3_p",
    "3_w:3_b,3_g,5_r,3_p",
    "3_r:3_w,5_b,3_g,3_p",
    "5_b:7_w,3_b",
    "4_p:7_r",
    "4_b:7_w",
    "4_b:6_w,3_b,3_p",
    "5_w:3_w,7_p",
    "4_r:7_g",
    "3_p:3_w,3_b,5_g,3_r",
    "5_p:7_r,3_p",
    "5_r:7_g,3_r",
    "3_g:5_w,3_b,3_r,3_p",
    "4_g:7_b",
    "4_r:3_b,6_g,3_r",
    "5_g:7_b,3_g",
    "4_w:3_w,3_r,6_p",
    "4_g:3_w,6_b,3_g",
    "3_b:3_w,3_g,3_r,5_p",
    "4_w:7_p"
]);

const Color = {
    red: 'red',
    blue: 'blue',
    green: 'green',
    white: 'white',
    yellow: 'yellow',
    wildcard: 'wildcard'
};

const identifyColor = character => {
    if (character === "r") {
        return Color.red;
    } else if (character === "b") {
        return Color.blue;
    } else if (character === "g") {
        return Color.green;
    } else if (character === "w") {
        return Color.white;
    } else if (character === "p") {
        return Color.yellow;
    }
};

const createCards = array => {
    var shuffledArray = Utils.shuffle(array);
    var cards = [];
    var cardIndex = 0;
    for (var entry of shuffledArray) {
        var card = {
            cardIndex,
            reference: entry
        };
        cardIndex += 1;
        var array1 = entry.split(":");
        var array2 = array1[0].split("_");
        var array3 = array1[1].split(",");
        card.points = parseInt(array2[0]);
        card.color = identifyColor(array2[1]);
        card.payment = [];
        for (var req of array3) {
            var array4 = req.split("_");
            card.payment.push({
                amount: parseInt(array4[0]),
                color: identifyColor(array4[1])
            });
        }
        card.isEnabled = false;
        card.isSelected = false;
        cards.push(card);
    }
    return cards;
};

const createRows = () => {
    return {
        row1: createCards(ROW1),
        row2: createCards(ROW2),
        row3: createCards(ROW3)
    };
};

const createCoins = () => {
    return {
        red: {
            count: 7,
            isEnabled: false,
            isSelected: false
        },
        blue: {
            count: 7,
            isEnabled: false,
            isSelected: false
        },
        green: {
            count: 7,
            isEnabled: false,
            isSelected: false
        },
        white: {
            count: 7,
            isEnabled: false,
            isSelected: false
        },
        yellow: {
            count: 7,
            isEnabled: false,
            isSelected: false
        },
        wildcard: {
            count: 5,
            isEnabled: false,
            isSelected: false
        }
    }
};
const createPlayers = sessionIds => {
    var players = [];
    for (var sessionId of sessionIds) {
        var player = {
            sessionId
        };
        player.coins = {
            red: 0,
            blue: 0,
            green: 0,
            white: 0,
            yellow: 0,
            wildcard: 0
        };
        player.cards = [];
        player.reservedCards = [];
        players.push(player);
    }
    return players;
};

const playerCoinCount = coins => {
    return (
        coins.red +
        coins.blue +
        coins.green +
        coins.white +
        coins.yellow +
        coins.wildcard
    );
};

class Splendor {
    async start(sessionIds, dispatch) {
        const coins = createCoins();
        const rows = createRows();
        const players = createPlayers(sessionIds);
        const turn = 0;
        const lastStartingTurn = 0;
        
        var gameState = {
            rows,
            coins,
            players,
            turn,
            lastStartingTurn
        };
        
        await dispatch(gameState);
    }
    
    async restart(gameState, dispatch) {
        const coins = createCoins();
        const rows = createRows();
        const sessionIds = gameState.players.map(player => player.sessionId);
        const players = createPlayers(sessionIds);
        const playerCount = gameState.players.length;
        const startingTurn = (gameState.lastStartingTurn + 1) % playerCount;
        
        await dispatch({
            rows,
            coins,
            players,
            turn: startingTurn,
            lastStartingTurn: startingTurn
        });
    }
    
    filterGameState(gameState, sessionId) {
        return {
            ...gameState,
            rows: {
                row1: gameState.rows.row1.slice(0, 5),
                row2: gameState.rows.row2.slice(0, 5),
                row3: gameState.rows.row3.slice(0, 5)
            }
        };
    }
    
    async updateState(gameState, sessionId, playerState, dispatch) {
        const player = gameState.players[gameState.turn];
        if (sessionId !== player.sessionId) {
            await dispatch(gameState);
            return;
        }
        
        if (playerState.purchaseCard) {
            await this.handlePurchaseCard(gameState, sessionId, playerState, dispatch);
        } else if (playerState.reserveCard) {
            await this.handleReserveCard(gameState, sessionId, playerState, dispatch);
        } else if (playerState.takeCoin) {
            await this.handleTakeCoin(gameState, sessionId, playerState, dispatch);
        } else {
            await dispatch(gameState);
        }
    }
    
    async handlePurchaseCard(gameState, sessionId, playerState, dispatch) {
        var gameState = gameState;
        var player = gameState.players[gameState.turn];
        
        var cardIndex = playerState.cardIndex;
        var row = playerState.row;
        var rows = gameState.rows;
        var card = rows[row][cardIndex];
        card.isSelected = true;
        rows[row][cardIndex] = card;
        
        await dispatch({
            ...gameState,
            rows
        });
        
        await Utils.sleep(STATE_TRANSITION_TIME);
        
        rows[row].splice(cardIndex, 1);
        card.isSelected = false;
        
        for (var payment of card.payment) {
            var color = payment.color;
            var amount = payment.amount;
            if (player.coins[color] + player.coins[Color.wildcard] < amount) {
                await dispatch(gameState);
                return;
            }
        }
        
        for (var payment of card.payment) {
            var color = payment.color;
            var amount = payment.amount;
            if (player.coins[color] + player.coins[Color.wildcard] < amount) {
                await dispatch(gameState);
                return;
            }
            
            if (player.coins[color] >= amount) {
                player.coins[color] = player.coins[color] - amount;
            } else {
                var remainingAmount = remainingAmount - player.coins[color];
                player.coins[color] = player.coins[color] - amount;
                player.coins[Color.wildcard] = player.coins[Color.wildcard] - remainingAmount;
            }
        }
        
        gameState.rows = rows;
        gameState.players[gameState.turn] = player;
        await dispatch(gameState);
    }
    
    async handleReserveCard(gameState, sessionId, playerState, dispatch) {
        var gameState = gameState;
        
        var player = gameState.players[gameState.turn];
        if (player.reservedCards.length >= 3) {
            await dispatch(gameState);
            return
        }
        
        var cardIndex = playerState.cardIndex;
        var row = playerState.row;
        var rows = gameState.rows;
        var card = rows[row][cardIndex];
        card.isSelected = true;
        rows[row][cardIndex] = card;
        
        await this.handleTakeCoin(gameState, sessionId, {coins: [Color.wildcard]}, dispatch);
        
        gameState.rows = rows;
        await dispatch(gameState);
        
        await Utils.sleep(STATE_TRANSITION_TIME);
        
        rows[row].splice(cardIndex, 1);
        card.isSelected = false;
        player.reservedCards.push(card);
        
        gameState.rows = rows;
        gameState.players[gameState.turn] = player;
        await dispatch(gameState);
    }
    
    async handleTakeCoin(gameState, sessionId, playerState, dispatch) {
        var gameState = gameState;
        
        var coins = playerState.coins;
        var player = gameState.players[gameState.turn];
        var coinCount = playerCoinCount(player.coins);
        if (coinCount + coins.length > 3) {
            await dispatch(gameState);
            return;
        }
        
        var gameCoins = gameState.coins;
        for (var coin of coins) {
            gameCoins[coin].isSelected = true;
        }
        
        gameState.coins = gameCoins;
        await dispatch(gameState);
        
        await Utils.sleep(STATE_TRANSITION_TIME);

        for (var coin of coins) {
            gameCoins[coin].isSelected = false;
        }
        
        if (coins.length === 3) {
            for (var coin of coins) {
                if (gameCoins[coin].count == 0) {
                    await dispatch(gameState);
                    return;
                }
                gameCoins[coin].count -= 1;
                player.coins[coin] += 1;
            }
        } else if (coins.length === 2) {
            for (var coin of coins) {
                if (coin == Color.wildcard) {
                    await dispatch(gameState);
                    return;
                }
                if (gameCoins[coin].count < 4) {
                    await dispatch(gameState);
                    return;
                }
                gameCoins[coin].count -= 2;
                player.coins[coin] += 2;
                break;
            }
        } else {
            if (gameCoins[coin].count == 0) {
                await dispatch(gameState);
                return;
            }
            gameCoins[Color.wildcard].count -= 1;
            player.coins[Color.wildcard] += 1;
        }
        
        gameState.coins = gameCoins;
        gameState.players[gameState.turn] = player;
        await dispatch(gameState);
    }
    
    async handlePlayerEntry(gameState, sessionId, dispatch) {
        await dispatch(gameState);
    }
    
    async handlePlayerExit(gameState, sessionId, dispatch) {
        await dispatch(gameState);
    }
}

module.exports.Splendor = new Splendor();
