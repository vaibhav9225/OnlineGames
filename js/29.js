// Constants
const CARD_DELIMITER = '_';
const TARGET_SUFFIX = 'Target';
const PENDING_PLAY = 'card_back';
const YOUR_TARGET = 'Your Target';
const OPPOSITION_TARGET = 'Opposition Target';
const PLAYER_COUNT = 4;
const DEALT_CARDS = 8;
const MIN_REQUIRED_POINTS = 16;
const MAX_REQUIRED_POINTS = 29;
const PLAYER_ONE = 0;
const PLAYER_TWO = 1;
const PLAYER_THREE = 2;
const PLAYER_FOUR = 3;

// Overrides
minPlayersRequired = 1;
gameName = 'TwentyNine';
splashImage = getSplashUrl('/splash/29.png');
splashSize = 'small';


// 29 Specific Global Variables
var selectedTrump;

const CardTypes = [
    'diamonds',
    'spades',
    'clubs',
    'hearts'
];

const showGameMenu = () => {
    $('#forfeit').addClass('hidden');
    $('#setTrump').addClass('hidden');
    $('#selectTrumpText').addClass('hidden');
    $('#revealedTrumpText').addClass('hidden');
    $('#revealTrump').addClass('hidden');
    $('#showTrump').addClass('hidden');
    $('#scoreboard').removeClass('hidden');
    if (gameState.trumpCard.isRevealed) {
        $('#revealTrump').addClass('hidden');
        $('#showTrump').removeClass('hidden');
        $('#trumpType').text(capitalize(gameState.trumpCard.type));
    } else if (gameState.trumpCard.isSet && !gameState.gameWinner) {
        $('#revealTrump').removeClass('hidden');
        $('#revealTrump').addClass('disabled');
        if (gameState.trumpCard.canReveal) {
            $('#revealTrump').removeClass('disabled');
        }
        $('#showTrump').addClass('hidden');
    }
    if (gameState.trumpCard.isSet && !gameState.gameWinner) {
        $('#forfeit').removeClass('hidden');
        $('#forfeit').addClass('disabled');
        if (gameState.canForfeit) {
            $('#forfeit').removeClass('disabled');
        }
    }
};

const showTrumpSelectionMenu = () => {
    $('#scoreboard').addClass('hidden');
    $('#forfeit').addClass('hidden');
    $('#revealTrump').addClass('hidden');
    $('#showTrump').addClass('hidden');
    $('#revealedTrumpText').addClass('hidden');
    $('#setTrump').removeClass('hidden');
    $('#selectTrumpText').removeClass('hidden');
    if (selectedTrump) {
        $('#setTrump').removeClass('disabled');
    } else {
        $('#setTrump').addClass('disabled');
    }
};

const showTrumpRevealedMenu = () => {
    $('#scoreboard').addClass('hidden');
    $('#forfeit').addClass('hidden');
    $('#revealTrump').addClass('hidden');
    $('#showTrump').removeClass('hidden');
    $('#setTrump').addClass('hidden');
    $('#selectTrumpText').addClass('hidden');
    $('#revealedTrumpText').removeClass('hidden');
};

const showTrumpSelectionDimmer = () => {
    $('#playerRow1').addClass('hidden');
    $('#playerRow2').addClass('hidden');
    $('.trumpRevealer').addClass('hidden');
    $('.trumpSelector').removeClass('hidden');
    $('.trumpSelectorCheck').addClass('hidden');
    $('#trumpSelectionContainer').removeClass('hidden');
    showTrumpSelectionMenu();
    $('#trumpSelectionContainer').dimmer('show');
};

const showTrumpRevealedDimmer = () => {
    const trumpType = gameState.trumpCard.type;
    $('#playerRow1').addClass('hidden');
    $('#playerRow2').addClass('hidden');
    $('.trumpRevealer').removeClass('hidden');
    $('.trumpSelector').addClass('hidden');
    for (var cardType of CardTypes) {
        $('.trumpRevealer').removeClass(cardType + 'Selector');
    }
    $('.trumpRevealer').addClass(trumpType + 'Selector');
    $('#trumpSelectionContainer').removeClass('hidden');
    showTrumpRevealedMenu();
    $('#trumpSelectionContainer').dimmer('show');
};

const getPlayedCards = () => {
    return gameState.playedCards.reduce((cardMap, card) => {
        cardMap[PLAYER_PREFIX + card.playerIndex] = card.name + CARD_DELIMITER + card.type;
        return cardMap;
    }, {});
};

const showPlayerRows = () => {
    $('#playerRow1').html('');
    $('#playerRow2').html('');
    const players = getGamePlayers(gameState.players);
    const playedCards = getPlayedCards();
    for (var i = 0; i < players.length; i++) {
        const player = players[i];
        const playedCard = {
            ...player,
            playedCard: playedCards[player.playerIndex] || PENDING_PLAY
        };
        const destinationId = i < PLAYER_COUNT / 2 ? 'playerRow1' : 'playerRow2';
        const renderType = i < PLAYER_COUNT / 2 ? RenderType.append : RenderType.prepend;
        renderTemplate('playedCardTemplate', destinationId, playedCard, renderType);
    }
    $('#playerRow1').removeClass('hidden');
    $('#playerRow2').removeClass('hidden');
    $('#trumpSelectionContainer').addClass('hidden');
    const turnSelector = '#' + PLAYER_PREFIX + gameState.turn;
    pulse(turnSelector);
    showGameMenu();
};

const showCardRows = () => {
    $('#cardRow1').html('');
    $('#cardRow2').html('');
    const dealtCards = gameState.dealtCards;
    for (var i = 0; i < dealtCards.length; i++) {
        const card = dealtCards[i];
        const destinationId = i < DEALT_CARDS / 2 ? 'cardRow1' : 'cardRow2';
        renderTemplate('dealtCardsTemplate', destinationId, {
            cardIndex: card.cardIndex,
            dealtCard: card.name + CARD_DELIMITER + card.type,
            canPlay: card.canPlay ? '' : 'disabled'
        }, RenderType.append);
    }
    $('#cardRow1').removeClass('disabled');
    $('#cardRow2').removeClass('disabled');
    $('#cardRow1').removeClass('hidden');
    $('#cardRow2').removeClass('hidden');
    $('#setTargetRow').addClass('hidden');
};

const disabledCardRows = () => {
    $('#cardRow1').addClass('disabled');
    $('#cardRow2').addClass('disabled');
};

const removeLoadingStates = () => {
    $('#forfeit').removeClass('loading');
    $('#forfeit').removeClass('disabled');
    $('#setTrump').removeClass('loading');
    $('#setTrump').removeClass('disabled');
    $('#revealTrump').removeClass('loading');
    $('#revealTrump').removeClass('disabled');
    $('#setTarget').removeClass('loading');
    $('#setTarget').removeClass('disabled');
    $('#passTarget').removeClass('loading');
    $('#passTarget').removeClass('disabled');
};

const disableTargetButtons = () => {
    $('#lowerTarget').addClass('disabled');
    $('#raiseTarget').addClass('disabled');
    $('#setTarget').addClass('disabled');
    $('#passTarget').addClass('disabled');
};

const enableTargetButtons = () => {
    $('#lowerTarget').removeClass('disabled');
    $('#raiseTarget').removeClass('disabled');
    $('#setTarget').removeClass('disabled');
    $('#passTarget').addClass('disabled');
    const playerTarget = gameState.playerTargets[gameState.playerIndex];
    const minRequiredPoints = playerTarget.minRequiredPoints;
    if (minRequiredPoints > MIN_REQUIRED_POINTS) {
        $('#passTarget').removeClass('disabled');
    }
};

const showSetTargetRow = () => {
    enableTargetButtons();
    const playerTarget = gameState.playerTargets[gameState.turn];
    const minRequiredPoints = playerTarget.minRequiredPoints;
    $('#setTargetField').attr('minRequiredPoints', minRequiredPoints);
    $('#setTargetField').text(minRequiredPoints);
    $('#lowerTarget').addClass('disabled');
    $('#cardRow1').removeClass('hidden');
    $('#cardRow2').addClass('hidden');
    $('#setTargetRow').removeClass('hidden');
};

const showTarget = () => {
    $('#targetLabel').addClass('hidden');
    $('#playCardLoader').addClass('hidden');
    $('.playerTarget').addClass('hidden');
    const gameTarget = gameState.gameTarget;
    const playerTeam = gameState.team;
    const targetTeam = gameTarget.team;
    const targetText = playerTeam === targetTeam ? YOUR_TARGET : OPPOSITION_TARGET;
    const requiredPoints = gameTarget.requiredPoints;
    if (typeof gameTarget.playerIndex !== 'undefined') {
        $('#target').text(requiredPoints);
        $('#targetText').text(targetText);
        $('#targetLabel').removeClass('hidden');
        const playerSelector = '#' + PLAYER_PREFIX + gameTarget.playerIndex + TARGET_SUFFIX;
        $(playerSelector).text(requiredPoints);
        $(playerSelector).removeClass('hidden');
    }
};

const populateScoreboard = () => {
    const teamAScore = gameState.teamA.score;
    const teamBScore = gameState.teamB.score;
    $('.teamAScore').text(teamAScore);
    $('.teamBScore').text(teamBScore);
    const players = getGamePlayers(gameState.players);
    const teamAPlayers = [players[PLAYER_ONE], players[PLAYER_THREE]];
    const teamBPlayers = [players[PLAYER_TWO], players[PLAYER_FOUR]];
    renderTemplate('lobbyPlayerTemplate', 'teamAPlayersList', teamAPlayers);
    renderTemplate('lobbyPlayerTemplate', 'teamBPlayersList', teamBPlayers);
    $('#scoreboardView .avatar').removeClass('tiny');
    $('#scoreboardView .avatar').addClass('mini');
};

const showScoreboard = () => {
    const gameWinner = gameState.gameWinner;
    if (gameWinner) {
        $('#winnerTeam').text(capitalize(gameWinner.winnerTeam));
        $('#setterTeam').text(capitalize(gameWinner.setterTeam));
        $('#requiredPoints').text(gameWinner.requiredPoints);
        $('#acquiredPoints').text(gameWinner.acquiredPoints);
        $('#winnerHeader').removeClass('hidden');
        $('#winnerContent').removeClass('hidden');
    } else {
        $('#winnerHeader').addClass('hidden');
        $('#winnerContent').addClass('hidden');
    }
    showModal('#scoreboardView');
};

const hideScoreboard = () => {
    hideModal('#scoreboardView');
};

refreshGameDelegate = payload => {
    const isPlayerTurn = gameState.isPlayerTurn;
    const isTargetSet = gameState.gameTarget.isSet;
    const isTrumpSet = gameState.trumpCard.isSet;
    const isTrumpRevealed = gameState.trumpCard.isRevealed;
    const isRevealNotified = gameState.trumpCard.isRevealNotified;
    if (!gameState.gameWinner) {
        hideScoreboard();
    }
    removeLoadingStates();
    if (isPlayerTurn && !gameState.gameWinner) {
        notifyPlayer();
    }
    if (isPlayerTurn && !isTargetSet) {
        showPlayerRows();
        showCardRows();
        showSetTargetRow();
    } else if (isPlayerTurn && !isTrumpSet) {
        showTrumpSelectionDimmer();
        showCardRows();
    } else {
        showPlayerRows();
        showCardRows();
    }
    if (isTrumpRevealed && !isRevealNotified) {
        showTrumpRevealedDimmer();
        disabledCardRows();
    } else if  (isTrumpRevealed && isRevealNotified) {
        showCardRows();
    }
    showTarget();
    populateScoreboard();
    if (gameState.gameWinner) {
        showScoreboard();
    }
};

$(document).ready(function() {

$('.trumpSelector').click(function() {
    $('.trumpSelectorCheck').addClass('hidden');
    $('.trumpSelectorCheck', this).removeClass('hidden');
    selectedTrump = $(this).attr('type');
    showTrumpSelectionMenu();
});

$('#forfeit').click(function() {
    $(this).addClass('loading');
    $(this).addClass('disabled');
    updateGameState({
        forfeit: true
    });
});

$('#setTrump').click(function() {
    $(this).addClass('loading');
    $(this).addClass('disabled');
    updateGameState({
        trumpCardType: selectedTrump
    });
});

$('#revealTrump').click(function() {
    $(this).addClass('loading');
    $(this).addClass('disabled');
    updateGameState({
        revealTrump: true
    });
});

$('#lowerTarget').click(function() {
    const minRequiredPoints = parseInt($('#setTargetField').attr('minRequiredPoints'));
    var target = parseInt($('#setTargetField').text());
    if (target > minRequiredPoints) {
        target -= 1;
    }
    $('#setTargetField').text(target);
    $('#raiseTarget').removeClass('disabled');
    if (target <= minRequiredPoints) {
        $(this).addClass('disabled');
    }
});

$('#raiseTarget').click(function() {
    var target = parseInt($('#setTargetField').text());
    if (target < MAX_REQUIRED_POINTS) {
        target += 1;
    }
    $('#setTargetField').text(target);
    $('#lowerTarget').removeClass('disabled');
    if (target >= MAX_REQUIRED_POINTS) {
        $(this).addClass('disabled');
    }
});

$('#setTarget').click(function() {
    var target = parseInt($('#setTargetField').text());
    disableTargetButtons();
    $(this).addClass('loading');
    updateGameState({
        requiredPoints: target
    });
});

$('#passTarget').click(function() {
    disableTargetButtons();
    $(this).addClass('loading');
    updateGameState({
        hasPassed: true
    });
});

$(document).on('click', '.dealtCard', function() {
    $(this).addClass('disabled');
    const playedCardIndex = $(this).attr('cardIndex');
    updateGameState({
        playedCardIndex
    });
    $('#targetLabel').addClass('hidden');
    $('#playCardLoader').removeClass('hidden');
});

$('#scoreboard').click(function() {
    showScoreboard();
});

$('#restartGame').click(function() {
    $('#startGame').trigger('click');
    hideScoreboard();
});

$('.trumpRevealer').removeClass(function (index, className) {
    return (className.match (/Selector/g) || []).join(' ');
});

});
