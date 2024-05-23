// Constants
const PLAYER_PREFIX = 'player';
const NO_PLAYER = '<No Player>';
const BOT_PLAYER = 'BOT';
const DEFAULT_AVATAR_ID = '0';

// Global Variables
var gameName = 'Quarentine Games';
var isGameActive = false;
var minPlayersRequired = 14;
var splashDuration = 250;
var splashImage = '';
var splashSize = 'small';
var splashInProgress = false;
var notification = new audioElement('./audio/notification.mp3');
var pendingPlayerAction = false;
var players;
var gameState;

const isMobile = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile;
}

const checkAutoLogin = () => {
    const autoLogin = sessionStorage.getItem('autoLoginEnabled');
    if (autoLogin === 'true' && isMobile()) { // FIX THIS
        sessionStorage.setItem('autoLoginEnabled', false);
        $(document).ready(function() {
            setupLobby('Joining Party');
        });
    }
}

const notifyPlayer = () => {
    if (pendingPlayerAction) {
        return;
    }
    pendingPlayerAction = true;
    notification.play();
};

const clearPendingAction = () => {
    pendingPlayerAction = false;
};

const generateLobbyCode = () => {
  return (Math.floor(Math.random() * (100000 - 10000) + 10000)).toString();
};

const getLobbyCode = () => {
    return sessionStorage.getItem('lobbyCode');
};

const updateGameState = playerState => {
    clearPendingAction();
    const payload = {
        action: 'updateGameState',
        gameName,
        lobbyCode: getLobbyCode(),
        playerState
    }
    sendMessage(payload);
};

const setButtonState = (selector, disabled) => {
    if (disabled) {
        $(selector).removeClass('disabled');
    } else {
        $(selector).addClass('disabled');
    }
};

const showSplash = () => {
    splashInProgress = true;
    $('#splashImageContainer').addClass(splashSize);
    $('#splashImage').attr('src', splashImage);
    $('#splash').dimmer('show', { show : 250, hide : 250 });
    setTimeout(() => {
        splashInProgress = false;
        $('#splash').dimmer('hide');
    }, splashDuration);
};

const showModal = selector => {
    if (splashInProgress) {
        return;
    }
    $(selector).modal('show');
};

const hideModal = selector => {
    $(selector).modal('hide');
};

const getPlayers = () => {
    return players.reduce((playerMap, player) => {
        playerMap[player.sessionId] = player;
        return playerMap;
    }, {});
};

const getGamePlayers = sessionIds => {
    const players = getPlayers();
    var gamePlayers = [];
    for (var i = 0; i < sessionIds.length; i++) {
        const playerIndex = PLAYER_PREFIX + i;
        const sessionId = sessionIds[i];
        const player = players[sessionId] || { playerName: sessionId == 'BOT_SESSION' ? BOT_PLAYER : NO_PLAYER, avatarId: DEFAULT_AVATAR_ID };
        gamePlayers.push({
            playerIndex,
            playerName: player.playerName,
            avatarId: player.avatarId
        });
    }
    return gamePlayers;
};

const refreshLobby = payload => {
    if (isGameActive) {
        return;
    }
    renderTemplate('lobbyPlayerTemplate', 'playersList', payload.players);
    showModal('#lobby');
    $('#gameLoader').removeClass('active');
    $('#lobbyCodeLabel').text(sessionStorage.getItem('lobbyCode'));
    setButtonState('#startGame', payload.players.length >= minPlayersRequired);
};

var refreshGameDelegate = payload => {};

const refreshGame = payload => {
    players = payload.players;
    gameState = payload.gameState;
    if (gameState.gameName !== gameName) {
        return;
    }
    hideModal('#lobby');
    $('#gameLoader').removeClass('active');
    $('#gameContainer').removeClass('hidden');
    if (!isGameActive) {
        showSplash();
    }
    isGameActive = true;
    refreshGameDelegate(payload);
};

var handlePlayerEntryDelegate = payload => {};

const handlePlayerEntry = payload => {
    handlePlayerEntryDelegate(payload);
};

var handlePlayerExitDelegate = payload => {};

const handlePlayerExit = payload => {
    handlePlayerExitDelegate(payload);
};

const checkButtonState = playerName => {
    const lobbyCode = $('#lobbyCode').val();
    sessionStorage.setItem('lobbyCode', lobbyCode);
    document.location.hash = 'lobbyCode=' + lobbyCode;
    setButtonState('#createLobby', playerName !== '');
    setButtonState('#joinLobby', playerName !== '' && lobbyCode !== '');
};

const setupLobbyFields = () => {
    const playerName = sessionStorage.getItem('playerName');
    $('#creatorName').val(playerName);
    $('#playerName').val(playerName);
    var lobbyCode = getUrlParams().lobbyCode;
    if (!lobbyCode) {
        lobbyCode = sessionStorage.getItem('lobbyCode');
    } else {
        sessionStorage.setItem('lobbyCode', lobbyCode);
    }
    $('#lobbyCode').val(lobbyCode);
    $('#createLobby').css('cursor','pointer');
    $('#joinLobby').css('cursor','pointer');
    $('#startGame').css('cursor','pointer');
};

const setupLobby = loaderText => {
    var sessionId = sessionStorage.getItem('sessionId');
    if (sessionId === null || sessionId === '') {
        sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    sessionStorage.setItem('sessionId', sessionId);

    const playerName = sessionStorage.getItem('playerName');
    const lobbyCode = sessionStorage.getItem('lobbyCode');

    if (playerName === null || playerName === '' || lobbyCode === null || lobbyCode === '') {
        return;
    }

    document.location.hash = 'lobbyCode=' + lobbyCode;
    const payload = {
        action: 'joinLobby',
        playerName,
        lobbyCode,
        sessionId
    }
    sendMessage(payload);
    $('#loaderText').text(loaderText);
    $('#gameLoader').addClass('active');
    hideModal('#gameSetup');
};

const disableRightClick = () => {
    document.addEventListener('contextmenu', event => event.preventDefault());
};

// Setup Message Handlers
onSocketOpen = () => {
    checkAutoLogin();
};
messageHandlers = {
    refreshLobby,
    refreshGame,
    handlePlayerEntry,
    handlePlayerExit
};

$(document).ready(function() {

$('#creatorName').on('keyup', function() {
    const playerName = $('#creatorName').val();
    $('#playerName').val(playerName);
    sessionStorage.setItem('playerName', playerName);
    checkButtonState(playerName);
});

$('#playerName').on('keyup', function() {
    const playerName = $('#playerName').val();
    $('#creatorName').val(playerName);
    sessionStorage.setItem('playerName', playerName);
    checkButtonState(playerName);
});

$('#lobbyCode').on('keyup', function() {
    const playerName = $('#playerName').val();
    checkButtonState(playerName);
});

$('#createLobby').on('click', function() {
    sessionStorage.setItem('lobbyCode', generateLobbyCode());
    setupLobby('Creating Party');
    //notification.bypassPermissions();
});

$('#joinLobby').on('click', function() {
    setupLobby('Joining Party');
    //notification.bypassPermissions();
});

$(document).on('click', '#lobbyCodeContainer', function() {
    const gameUrl = window.location.href;
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(gameUrl).select();
    document.execCommand("copy");
    $temp.remove();
});

$('#startGame').on('click', function() {
    const lobbyCode = sessionStorage.getItem('lobbyCode');
    const payload = {
        action: 'startGame',
        gameName,
        lobbyCode
    }
    sendMessage(payload);
    $('#loaderText').text('Starting Game');
    $('#gameLoader').addClass('active');
    hideModal('#lobby');
});

// Initialization
$('#gameSetup').modal('setting', 'closable', false);
$('#lobby').modal('setting', 'closable', false);
$('.ui.dimmer').dimmer({ closable: false });
showModal('#gameSetup');
setupLobbyFields();
setButtonState(
    '#createLobby',
    sessionStorage.getItem('playerName') !== null
    && sessionStorage.getItem('playerName') !== ''
);
setButtonState(
    '#joinLobby',
    sessionStorage.getItem('playerName') !== null
    && sessionStorage.getItem('playerName') !== ''
    && sessionStorage.getItem('lobbyCode') !== null
    && sessionStorage.getItem('lobbyCode') !== ''
);
setupConnection();
disableRightClick();

var needsRefresh = false;
function visibilityChangeListener() {
    if (!isMobile()) {
        return;
    }
    
    if (document.visibilityState === 'hidden') {
        needsRefresh = true;
    } else if (needsRefresh === true) {
        needsRefresh = false;
        sessionStorage.setItem('autoLoginEnabled', true);
        location.reload();
    }
}

document.addEventListener('visibilitychange', visibilityChangeListener);

});
