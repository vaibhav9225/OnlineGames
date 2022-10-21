const { ApiGatewayManagementApi } = require('aws-sdk');
const { Lobby } = require('Lobby');
const { Game } = require('Game');

const URL = 'https://9zc0v0lwud.execute-api.us-east-2.amazonaws.com/prod';
const apiClient = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: URL
});

const Actions = {
    handlePlayerEntry: 'handlePlayerEntry',
    handlePlayerExit: 'handlePlayerExit',
    refreshLobby: 'refreshLobby',
    refreshGame: 'refreshGame'
};

class Dispatch {
    // NOTE: Call along with constructor.
    async initialize(lobbyCode) {
        const results = await Lobby.getPlayers(lobbyCode);
        this.players = results.Items.map(player => {
            return ({
                playerName: player.playerName,
                avatarId: player.avatarId,
                sessionId: player.sessionId
            });
        });
        this.connections = results.Items.map(player => {
            return ({
                sessionId: player.sessionId,
                connectionId: player.connectionId
            });
        });
    }
    
    async postToConnection(params) {
        try {
            await apiClient.postToConnection(params).promise();
        } catch (error) {
            console.log("Error dispatching data: " + JSON.stringify(error));
        }
    }
    
    async notifyPlayers(payload) {
        for (var connection of this.connections) {
            const params = {
              ConnectionId: connection.connectionId,
              Data: JSON.stringify(payload)
            };
            await this.postToConnection(params);
        }
    }
    
    async handlePlayerEntry(playerName) {
        const payload = {
            action: Actions.handlePlayerEntry,
            playerName
        };
        await this.notifyPlayers(payload);
    }
    
    async handlePlayerExit(playerName) {
        const payload = {
            action: Actions.handlePlayerExit,
            playerName
        };
        await this.notifyPlayers(payload);
    }
    
    async refreshLobby() {
        const payload = {
            action: Actions.refreshLobby,
            players: this.players
        };
        await this.notifyPlayers(payload);
    }
    
    async refreshGame(gameState) {
        for (var connection of this.connections) {
            const filteredGameState = Game.filterState(gameState, connection.sessionId);
            const payload = {
                action: Actions.refreshGame,
                players: this.players,
                gameState: filteredGameState
            };
            const params = {
              ConnectionId: connection.connectionId,
              Data: JSON.stringify(payload)
            };
            await this.postToConnection(params);
        }
    }
}

module.exports.Dispatch = Dispatch;