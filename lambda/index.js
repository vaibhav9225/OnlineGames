const { Lobby } = require('Lobby');
const { Avatar } = require('Avatar');
const { Game } = require('Game');
const { Dispatch } = require('Dispatch');

const EventType = {
  connect: 'CONNECT',
  disconnect: 'DISCONNECT',
  message: 'MESSAGE'
};

const getDispatch = async lobbyCode => {
  const dispatch = new Dispatch();
  await dispatch.initialize(lobbyCode);
  return dispatch;
};

const joinLobby = async event => {
  const connectionId = event.requestContext.connectionId;
  const hasExistingConnection = await Lobby.hasExistingConnection(connectionId);
  if (hasExistingConnection) {
    return;
  };
  const payload = JSON.parse(event.body);
  const lobbyCode = payload.lobbyCode;
  const playerName = payload.playerName;
  const sessionId = payload.sessionId
  const avatarId = await Avatar.getAvator(lobbyCode);
  await Lobby.join(connectionId, sessionId, playerName, avatarId, lobbyCode);
  const dispatch = await getDispatch(lobbyCode);
  await dispatch.handlePlayerEntry(playerName);
  const gameExists = await Game.gameExists(lobbyCode);
  if (!gameExists) {
    await dispatch.refreshLobby();
  }
  await Game.handlePlayerEntry(lobbyCode, sessionId, async gameState => {
    await dispatch.refreshGame(gameState);
  });
};

const startGame = async event => {
  const payload = JSON.parse(event.body);
  const lobbyCode = payload.lobbyCode;
  const gameName = payload.gameName;
  const dispatch = await getDispatch(lobbyCode);
  await Game.start(lobbyCode, gameName, async gameState => {
    await dispatch.refreshGame(gameState);
  });
};

const updateGameState = async event => {
  const connectionId = event.requestContext.connectionId;
  const payload = JSON.parse(event.body);
  const lobbyCode = payload.lobbyCode;
  const playerState = payload.playerState;
  const dispatch = await getDispatch(lobbyCode);
  await Game.updateState(lobbyCode, connectionId, playerState, async gameState => {
    await dispatch.refreshGame(gameState);
  });
};

const messageHandlers = {
  joinLobby,
  startGame,
  updateGameState
};

const handleConnect = async event => {
  // HANDLE CONNECTION
};

const handleDisconnect = async event => {
  const connectionId = event.requestContext.connectionId;
  const connection = await Lobby.leave(connectionId);
  if (connection) {
    const lobbyCode = connection.lobbyCode;
    const sessionId = connection.sessionId;
    const playerName = connection.playerName;
    const dispatch = await getDispatch(lobbyCode);
    await dispatch.handlePlayerExit(playerName);
    await dispatch.refreshLobby();
    await Game.handlePlayerExit(lobbyCode, sessionId, async gameState => {
      await dispatch.refreshGame(gameState);
    });
  }
};

exports.handler = async (event) => {
  const eventType = event.requestContext.eventType;
  const routeKey = event.requestContext.routeKey;
  if (eventType === EventType.connect) {
    await handleConnect(event);
  } else if (eventType === EventType.message) {
    await messageHandlers[routeKey](event);
  } else if (eventType === EventType.disconnect) {
    await handleDisconnect(event); 
  }
  return {};
};