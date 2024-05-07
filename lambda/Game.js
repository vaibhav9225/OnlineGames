const { DynamoDB } = require('aws-sdk');
const { Utils } = require('Utils');
const { Lobby } = require('Lobby');
const { Codenames } = require('Codenames');
const { TwentyNine } = require('TwentyNine');
const { Splendor } = require('Splendor');

const dynamoDb = new DynamoDB.DocumentClient({
    api_version: '2012-08-10',
    region: 'us-east-2'
});

const GAMES_TABLE = 'games';
const INITIAL_STATE = {
    gameName: 'NONE'
};
const GameHandlers = {
    Codenames,
    TwentyNine,
    Splendor
};

class Game {
    async getState(lobbyCode) {
        var params = {
            TableName : GAMES_TABLE,
            Key: {
                lobbyCode
            }
        };
        const result = await dynamoDb.get(params).promise();
        if (Object.keys(result).length === 0) {
            return {};
        }
        return result.Item.gameState;
    }
    
    async setState(lobbyCode, gameState, dispatch) {
        var params = {
            TableName : GAMES_TABLE,
            Item: {
                lobbyCode,
                gameState
            }
        };
        await dynamoDb.put(params).promise();
        await dispatch(gameState);
        
        const handler = GameHandlers[gameState.gameName];
        if (typeof handler !== 'undefined') {
            await handler.handleBotPlay(gameState, async updatedState => {
                await this.setState(lobbyCode, updatedState, dispatch);
            })
        }
    }
    
    async gameExists(lobbyCode) {
        const gameState = await this.getState(lobbyCode);
        return gameState.gameName;
    };
    
    async restart(lobbyCode, gameName, gameState, dispatch) {
        const handler = GameHandlers[gameName];
        if (typeof handler === 'undefined') {
            return;
        }
        await handler.restart(gameState, async refreshedState => {
            var updatedState = refreshedState;
            updatedState.gameName = gameName;
            await this.setState(lobbyCode, updatedState, dispatch);
        });
    }
    
    async start(lobbyCode, gameName, dispatch) {
        const handler = GameHandlers[gameName];
        if (typeof handler === 'undefined') {
            return;
        }
        const gameState = await this.getState(lobbyCode);
        if (Object.keys(gameState).length !== 0) {
            await this.restart(lobbyCode, gameName, gameState, dispatch);
            return;
        }
        const results = await Lobby.getPlayers(lobbyCode);
        const sessionIds = results.Items.map(player => player.sessionId);
        await handler.start(sessionIds, async gameState => {
            var newState = gameState;
            newState.gameName = gameName;
            await this.setState(lobbyCode, newState, dispatch);
        });
    }
    
    filterState(gameState, sessionId) {
        const handler = GameHandlers[gameState.gameName];
        if (typeof handler === 'undefined') {
            return INITIAL_STATE;
        }
        return handler.filterGameState(Utils.copy(gameState), sessionId);
    }
    
    async updateState(lobbyCode, connectionId, playerState, dispatch) {
        const connection = await Lobby.getConnection(connectionId);
        const sessionId = connection.sessionId;
        const gameState = await this.getState(lobbyCode);
        const handler = GameHandlers[gameState.gameName];
        if (typeof handler === 'undefined') {
            return INITIAL_STATE;
        }
        await handler.updateState(gameState, sessionId, playerState, async updatedState => {
            await this.setState(lobbyCode, updatedState, dispatch);
        });
    }
    
    async handlePlayerEntry(lobbyCode, sessionId, dispatch) {
        const gameState = await this.getState(lobbyCode);
        if (Object.keys(gameState).length === 0) {
            return;
        }
        const handler = GameHandlers[gameState.gameName];
        if (typeof handler === 'undefined') {
            return;
        }
        await handler.handlePlayerEntry(gameState, sessionId, async updatedState => {
            await this.setState(lobbyCode, updatedState, dispatch);
        });
    }
    
    async handlePlayerExit(lobbyCode, sessionId, dispatch) {
        const gameState = await this.getState(lobbyCode);
        if (Object.keys(gameState).length === 0) {
            return;
        }
        const handler = GameHandlers[gameState.gameName];
        if (typeof handler === 'undefined') {
            return;
        }
        await handler.handlePlayerExit(gameState, sessionId, async updatedState => {
            await this.setState(lobbyCode, updatedState, dispatch);
        });
    }
}

module.exports.Game = new Game();
