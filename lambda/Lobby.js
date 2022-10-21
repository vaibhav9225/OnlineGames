const { DynamoDB } = require('aws-sdk');

const dynamoDb = new DynamoDB.DocumentClient({
    api_version: '2012-08-10',
    region: 'us-east-2'
});

const LOBBY_TABLE = 'lobby';
const CONNECTIONS_TABLE = 'connections';

class Lobby {
    async getConnection(connectionId) {
        var params = {
            TableName : CONNECTIONS_TABLE,
            Key: {
                connectionId
            }
        };
        const result = await dynamoDb.get(params).promise();
        if(Object.keys(result).length === 0) {
            return {};
        }
        return result.Item;
    }
    
    async createConnection(connectionId, lobbyCode, sessionId, playerName) {
        var params = {
            TableName : CONNECTIONS_TABLE,
            Item: {
                connectionId,
                lobbyCode,
                sessionId,
                playerName
            }
        };
        await dynamoDb.put(params).promise();
    }
    
    async destroyConnection(connectionId) {
        var params = {
            TableName : CONNECTIONS_TABLE,
            Key: {
                connectionId
            }
        };
        await dynamoDb.delete(params).promise();
    }
    
    async hasExistingConnection(connectionId) {
        const connection = await this.getConnection(connectionId);
        return Object.keys(connection).length > 0;
    }
    
    async getPlayers(lobbyCode) {
        var params = {
            TableName : LOBBY_TABLE,
            KeyConditionExpression: "#id = :value",
            ExpressionAttributeNames:{
                "#id": "lobbyCode"
            },
            ExpressionAttributeValues: {
                ":value": lobbyCode
            }
        };
        return await dynamoDb.query(params).promise();
    }
    
    async createPlayerSession(lobbyCode, sessionId, playerName, avatarId, connectionId) {
        const params = {
            TableName: LOBBY_TABLE,
            Item: {
                lobbyCode,
                sessionId,
                playerName,
                avatarId,
                connectionId
            }
        };
        await dynamoDb.put(params).promise();
    }
    
    async destroyPlayerSession(lobbyCode, sessionId) {
        const params = {
            TableName: LOBBY_TABLE,
            Key: {
                lobbyCode,
                sessionId
            }
        };
        await dynamoDb.delete(params).promise();
    }
    
    async join(connectionId, sessionId, playerName, avatarId, lobbyCode) {
        await this.createConnection(connectionId, lobbyCode, sessionId, playerName);
        await this.createPlayerSession(lobbyCode, sessionId, playerName, avatarId, connectionId);
        return sessionId
    }
    
    async leave(connectionId) {
        const connection = await this.getConnection(connectionId);
        if (Object.keys(connection).length === 0) {
            return;
        }
        const lobbyCode = connection.lobbyCode;
        const sessionId = connection.sessionId;
        await this.destroyPlayerSession(lobbyCode, sessionId);
        await this.destroyConnection(connectionId);
        return connection;
    }
}

module.exports.Lobby = new Lobby();