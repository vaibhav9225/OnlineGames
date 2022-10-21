// Overrides
minPlayersRequired = 1;
gameName = 'Codenames';
splashImage = getSplashUrl('/splash/codenames.png');
splashSize = 'medium';

const Colors = {
    red: 'red',
    blue: 'blue',
    yellow: 'yellow',
    black: 'black',
    neutral: 'neutral'
};

const populateScoreboard = () => {
    const redTeamScore = gameState.redTeam.score;
    const blueTeamScore = gameState.blueTeam.score;
    $('.redTeamScore').text(redTeamScore);
    $('.blueTeamScore').text(blueTeamScore);
    const redTeamPlayers = getGamePlayers(gameState.redTeam.players);
    const blueTeamPlayers = getGamePlayers(gameState.blueTeam.players);
    renderTemplate('lobbyPlayerTemplate', 'redTeamPlayersList', redTeamPlayers);
    renderTemplate('lobbyPlayerTemplate', 'blueTeamPlayersList', blueTeamPlayers);
    $('#scoreboardView .avatar').removeClass('tiny');
    $('#scoreboardView .avatar').addClass('mini');
};

const showScoreboard = () => {
    if (gameState.gameWinner) {
        $('#winnerTeam').text(capitalize(gameState.gameWinner));
        $('#winnerHeader').removeClass('hidden');
    } else {
        $('#winnerHeader').addClass('hidden');
    }
    showModal('#scoreboardView');
};

const hideScoreboard = () => {
    hideModal('#scoreboardView');
};

const showMenu = () => {
    $('#becomeSpyMaster').addClass('hidden');
    $('#endTurn').addClass('hidden');
    $('#becomeSpyMaster').removeClass(Colors.red);
    $('#becomeSpyMaster').removeClass(Colors.blue);
    $('#becomeSpyMaster').addClass(gameState.teamColor);
    $('#endTurn').removeClass(Colors.red);
    $('#endTurn').removeClass(Colors.blue);
    $('#endTurn').addClass(gameState.turnColor);
    if (gameState.canBecomeSpyMaster) {
        $('#becomeSpyMaster').removeClass('hidden');
    } else {
        $('#endTurn').removeClass('hidden');
    }
    if (gameState.canEndTurn) {
        $('#endTurn').removeClass('disabled');
        $('#endTurn').text('End ' + capitalize(gameState.turnColor) + '\'s Turn');
    } else {
        $('#endTurn').addClass('disabled');
        $('#endTurn').text(capitalize(gameState.turnColor) + '\'s Turn');
    }
};

const populateRemainingWordCount = () => {
    $('#remainingRedWords').text(gameState.redTeam.remainingWords);
    $('#remainingBlueWords').text(gameState.blueTeam.remainingWords);
};

const populateWords = () => {
    renderTemplate('wordListTemplate', 'gameRow', gameState.words);
    if (!gameState.canPlay) {
        $('.word').addClass('disabled');
    }
};

const clearLoadingStates = () => {
    $('#becomeSpyMaster').removeClass('loading');
    $('#endTurn').removeClass('loading');
};

refreshGameDelegate = payload => {
    if (!gameState.gameWinner) {
        hideScoreboard();
    }
    clearLoadingStates();
    showMenu();
    populateRemainingWordCount();
    populateWords();
    populateScoreboard();
    if (gameState.gameWinner) {
        showScoreboard();
    }
};

$(document).ready(function() {

$('#scoreboard').click(function() {
    showScoreboard();
});

$('#becomeSpyMaster').click(function() {
    $(this).addClass('loading');
    updateGameState({
        becomeSpyMaster: true
    });
});

$('#endTurn').click(function() {
    $(this).addClass('loading');
    updateGameState({
        endTurn: true
    });
});

$(document).on('click', '.word', function() {
    pulse(this);
    updateGameState({
        wordIndex: $(this).attr('wordIndex')
    });
});

$('.restartGame').click(function() {
    $('#startGame').trigger('click');
    hideScoreboard();
});

});