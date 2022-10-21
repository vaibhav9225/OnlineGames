const { Utils } = require('Utils');

const Teams = {
    redTeam: 'redTeam',
    blueTeam: 'blueTeam'
};
const Colors = {
    red: 'red',
    blue: 'blue',
    yellow: 'yellow',
    black: 'black',
    neutral: 'neutral'
};
const DEFAULT_TURN = Teams.redTeam;
const NO_SPY_MASTER = -1;
const GAME_WORDS_COUNT = 24;
const COLOR_WORDS_COUNT = 9;
const STATE_TRANSITION_TIME = 3000;

const getOpposition = team => {
    return team === Teams.redTeam ? Teams.blueTeam : Teams.redTeam;
};
const getTeamColor = team => {
    return team === Teams.redTeam ? Colors.red : Colors.blue;
};
const getOppositionColor = color => {
    return color === Colors.red ? Colors.blue : Colors.red;
};
const divideTeams = players => {
    const blueTeamPlayers = players.slice(0, players.length / 2);
    const redTeamPlayers = players.slice(players.length / 2, players.length);
    return {
        redTeamPlayers,
        blueTeamPlayers
    };
};
const getTeam = (gameState, sessionId) => {
    if (gameState.redTeam.players.includes(sessionId)) {
        return Teams.redTeam;
    } else {
        return Teams.blueTeam;
    }
};
const getPlayerIndex = (gameState, sessionId) => {
    const team = getTeam(gameState, sessionId);
    return gameState[team].players.indexOf(sessionId);
};
const isSpyMaster = (gameState, sessionId) => {
    const team = getTeam(gameState, sessionId);
    const spyMasterIndex = gameState[team].spyMasterIndex;
    return sessionId === gameState[team].players[spyMasterIndex];
};
const canBecomeSpyMaster = (gameState, sessionId) => {
    const team = getTeam(gameState, sessionId);
    return gameState[team].spyMasterIndex === NO_SPY_MASTER;
};
const canPlay = (gameState, sessionId) => {
    const spyMaster = isSpyMaster(gameState, sessionId);
    return !spyMaster
    && !canBecomeSpyMaster(gameState, sessionId)
    && getTeam(gameState, sessionId) === gameState.turn && !gameState.gameWinner;
};
const canEndTurn = (gameState, sessionId) => {
    return !canBecomeSpyMaster(gameState, sessionId) && getTeam(gameState, sessionId) === gameState.turn;
};
const getUnbalancedTeam = gameState => {
    if (gameState.redTeam.players.length <= gameState.blueTeam.players.length) {
        return Teams.redTeam;
    } else {
        return Teams.blueTeam;
    }
};
const getRandomWords = count => {
    const dictionary = ["Hollywood", "Screen", "Play", "Marble", "Dinosaur", "Cat", "Pitch", "Bond", "Greece", "Deck", "Spike", "Center", "Vacuum", "Unicorn", "Undertaker", "Sock", "Loch Ness", "Horse", "Berlin", "Platypus", "Port", "Chest", "Box", "Compound", "Ship", "Watch", "Space", "Flute", "Tower", "Death", "Well", "Fair", "Tooth", "Staff", "Bill", "Shot", "King", "Pan", "Square", "Buffalo", "Scientist", "Chick", "Atlantis", "Spy", "Mail", "Nut", "Log", "Pirate", "Face", "Stick", "Disease", "Yard", "Mount", "Slug", "Dice", "Lead", "Hook", "Carrot", "Poison", "Stock", "Foot", "Torch", "Arm", "Figure", "Mine", "Suit", "Crane", "Beijing", "Mass", "Microscope", "Engine", "China", "Straw", "Pants", "Europe", "Boot", "Princess", "Link", "Luck", "Olive", "Palm", "Teacher", "Thumb", "Octopus", "Hood", "Tie", "Doctor", "Wake", "Cricket", "Millionaire", "New York", "State", "Bermuda", "Park", "Turkey", "Chocolate", "Trip", "Racket", "Bat", "Jet", "Shakespeare", "Bolt", "Switch", "Wall", "Soul", "Ghost", "Time", "Dance", "Amazon", "Grace", "Moscow", "Pumpkin", "Antarctica", "Whip", "Heart", "Table", "Ball", "Fighter", "Cold", "Day", "Spring", "Match", "Diamond", "Centaur", "March", "Roulette", "Dog", "Cross", "Wave", "Duck", "Wind", "Spot", "Skyscraper", "Paper", "Apple", "Oil", "Cook", "Fly", "Cast", "Bear", "Pin", "Thief", "Trunk", "America", "Novel", "Cell", "Bow", "Model", "Knife", "Knight", "Court", "Iron", "Whale", "Shadow", "Contract", "Mercury", "Conductor", "Seal", "Car", "Ring", "Kid", "Piano", "Laser", "Sound", "Pole", "Superhero", "Revolution", "Pit", "Gas", "Glass", "Washington", "Bark", "Snow", "Ivory", "Pipe", "Cover", "Degree", "Tokyo", "Church", "Pie", "Tube", "Block", "Comic", "Fish", "Bridge", "Moon", "Part", "Aztec", "Smuggler", "Train", "Embassy", "Pupil", "Scuba Diver", "Ice", "Tap", "Code", "Shoe", "Server", "Club", "Row", "Pyramid", "Bug", "Penguin", "Pound", "Himalayas", "Czech", "Rome", "Eye", "Board", "Bed", "Point", "France", "Mammoth", "Cotton", "Robin", "Net", "Bugle", "Maple", "England", "Field", "Robot", "Plot", "Africa", "Tag", "Mouth", "Kiwi", "Mole", "School", "Sink", "Pistol", "Opera", "Mint", "Root", "Sub", "Crown", "Back", "Plane", "Mexico", "Cloak", "Circle", "Tablet", "Australia", "Green", "Egypt", "Line", "Lawyer", "Witch", "Parachute", "Crash", "Gold", "Note", "Lion", "Plastic", "Web", "Ambulance", "Hospital", "Spell", "Lock", "Water", "London", "Casino", "Cycle", "Bar", "Cliff", "Round", "Bomb", "Giant", "Hand", "Ninja", "Rose", "Slip", "Limousine", "Pass", "Theater", "Plate", "Satellite", "Ketchup", "Hotel", "Tail", "Tick", "Ground", "Police", "Dwarf", "Fan", "Dress", "Saturn", "Grass", "Brush", "Chair", "Rock", "Pilot", "Telescope", "File", "Lab", "India", "Ruler", "Nail", "Swing", "Olympus", "Change", "Date", "Stream", "Missile", "Scale", "Band", "Angel", "Press", "Berry", "Card", "Check", "Draft", "Head", "Lap", "Orange", "Ice Cream", "Film", "Washer", "Pool", "Shark", "Van", "String", "Calf", "Hawk", "Eagle", "Needle", "Forest", "Dragon", "Key", "Belt", "Cap", "Drill", "Glove", "Paste", "Fall", "Fire", "Spider", "Spine", "Soldier", "Horn", "Queen", "Ham", "Litter", "Life", "Temple", "Rabbit", "Button", "Game", "Star", "Jupiter", "Vet", "Night", "Air", "Battery", "Genius", "Shop", "Bottle", "Stadium", "Alien", "Light", "Triangle", "Lemon", "Nurse", "Drop", "Track", "Bank", "Germany", "Worm", "Ray", "Capital", "Strike", "War", "Concert", "Honey", "Canada", "Buck", "Snowman", "Beat", "Jam", "Copper", "Beach", "Lemon", "Nurse", "Drop", "Track", "Bank", "Germany", "Worm", "Ray", "Capital", "Strike", "War", "Concert", "Honey", "Canada", "Buck", "Snowman", "Beat", "Jam", "Copper", "Beach"];
    return Utils.shuffle(dictionary);
};
const indexWords = words => {
    var updatedWords = words;
    for (var i = 0; i < updatedWords.length; i++) {
        updatedWords[i].wordIndex = i;
    }
    return updatedWords;
};
const getGameWords = primaryColor => {
    const words = getRandomWords(GAME_WORDS_COUNT);
    const coloredWords = [];
    for (var i = 0; i < GAME_WORDS_COUNT; i++) {
        const word = words[i];
        var color = Colors.yellow;
        if (i == 0) {
            color = Colors.black;
        } else if (i <= COLOR_WORDS_COUNT) {
            color = primaryColor;
        } else if (i <= (2 * COLOR_WORDS_COUNT) - 1) {
            color = getOppositionColor(primaryColor);
        }
        coloredWords.push({
            word,
            color,
            flipped: false
        });
    }
    return indexWords(Utils.shuffle(coloredWords));
};
const updateWords = (gameState, sessionId) => {
    return gameState.words.map(entry => ({
        ...entry,
        color: isSpyMaster(gameState, sessionId) || entry.flipped ? entry.color : Colors.neutral
    }));
};
const remainingWords = (words, color) => {
    return words.reduce((remainingWordCount, entry) => {
        if (!entry.flipped && entry.color === color) {
            remainingWordCount += 1;
        }
        return remainingWordCount;
    }, 0);
};

class Codenames {
    async start(sessionIds, dispatch) {
        const players = Utils.shuffle(sessionIds);
        const teams = divideTeams(players);
        const words = getGameWords(getTeamColor(DEFAULT_TURN));
        await dispatch({
            redTeam: {
                players: teams.redTeamPlayers,
                spyMasterIndex: NO_SPY_MASTER,
                score: 0,
                remainingWords: remainingWords(words, Colors.red)
            },
            blueTeam: {
                players: teams.blueTeamPlayers,
                spyMasterIndex: NO_SPY_MASTER,
                score: 0,
                remainingWords: remainingWords(words, Colors.blue)
            },
            words,
            startingTeam: DEFAULT_TURN,
            turn: DEFAULT_TURN
        });
    }
    
    async restart(gameState, dispatch) {
        const startingTeam = getOpposition(gameState.startingTeam);
        const words = getGameWords(getTeamColor(startingTeam));
        var redTeam = gameState.redTeam;
        var blueTeam = gameState.blueTeam;
        redTeam.spyMasterIndex = NO_SPY_MASTER;
        blueTeam.spyMasterIndex = NO_SPY_MASTER;
        redTeam.remainingWords = remainingWords(words, Colors.red);
        blueTeam.remainingWords = remainingWords(words, Colors.blue);
        await dispatch({
            redTeam,
            blueTeam,
            words,
            startingTeam,
            turn: getOpposition(gameState.turn)
        });
    }
    
    filterGameState(gameState, sessionId) {
        const team = getTeam(gameState, sessionId);
        return {
            ...gameState,
            isSpyMaster: isSpyMaster(gameState, sessionId),
            canPlay: canPlay(gameState, sessionId),
            canEndTurn: canEndTurn(gameState, sessionId),
            canBecomeSpyMaster: canBecomeSpyMaster(gameState, sessionId),
            team,
            teamColor: getTeamColor(team),
            turnColor: getTeamColor(gameState.turn),
            words: updateWords(gameState, sessionId)
        };
    }
    
    async handleEndTurn(gameState, sessionId, dispatch) {
        if (!canEndTurn(gameState, sessionId)) {
            return;
        }
        var updatedState = gameState;
        updatedState.turn = getOpposition(gameState.turn);
        await dispatch(updatedState);
    }
    
    async becomeSpyMaster(gameState, sessionId, dispatch) {
        if (!canBecomeSpyMaster(gameState, sessionId)) {
            return;
        }
        const team = getTeam(gameState, sessionId);
        var updatedState = gameState;
        updatedState[team].spyMasterIndex = getPlayerIndex(gameState, sessionId);
        await dispatch(updatedState);
    }
    
    async handlePlayerUpdates(gameState, sessionId, playerState, dispatch) {
        if (!canPlay(gameState, sessionId)) {
            return;
        }
        const team = gameState.turn;
        const wordIndex = parseInt(playerState.wordIndex);
        var updatedState = gameState;
        var words = gameState.words;
        var flippedWord = words[wordIndex];
        flippedWord.flipped = true;
        words[wordIndex] = flippedWord;
        updatedState.words = words;
        const remainingRedWords = remainingWords(words, Colors.red);
        const remainingBlueWords = remainingWords(words, Colors.blue);
        updatedState[Teams.redTeam].remainingWords = remainingRedWords;
        updatedState[Teams.blueTeam].remainingWords = remainingBlueWords;
        updatedState.turn = flippedWord.color === getTeamColor(team) ? team : getOpposition(team);
        await dispatch(updatedState);
        await Utils.sleep(STATE_TRANSITION_TIME);
        if (flippedWord.color === Colors.black) {
            const gameWinner = updatedState.turn;
            updatedState[gameWinner].score += 1;
            updatedState.gameWinner = gameWinner;
            updatedState.redTeam.spyMasterIndex = NO_SPY_MASTER;
            updatedState.blueTeam.spyMasterIndex = NO_SPY_MASTER;
            await dispatch(updatedState);
            return;
        }
        if (remainingRedWords === 0 || remainingBlueWords === 0) {
            const gameWinner = remainingRedWords === 0 ? Teams.redTeam : Teams.blueTeam;
            updatedState[gameWinner].score += 1;
            updatedState.gameWinner = gameWinner;
            updatedState.redTeam.spyMasterIndex = NO_SPY_MASTER;
            updatedState.blueTeam.spyMasterIndex = NO_SPY_MASTER;
            await dispatch(updatedState);
            return;
        }
    }
    
    async updateState(gameState, sessionId, playerState, dispatch) {
        if (playerState.endTurn) {
            await this.handleEndTurn(gameState, sessionId, dispatch);
        } else if (playerState.becomeSpyMaster) {
            await this.becomeSpyMaster(gameState, sessionId, dispatch);
        } else {
            await this.handlePlayerUpdates(gameState, sessionId, playerState, dispatch);
        }
    }
    
    async handlePlayerEntry(gameState, sessionId, dispatch) {
        const unbalancedTeam = getUnbalancedTeam(gameState);
        var updatedState = gameState;
        var players = gameState[unbalancedTeam].players;
        players.push(sessionId);
        updatedState[unbalancedTeam].players = players;
        await dispatch(updatedState);
    }
    
    async handlePlayerExit(gameState, sessionId, dispatch) {
        const team = getTeam(gameState, sessionId);
        var updatedState = gameState;
        if (isSpyMaster(gameState, sessionId)) {
            updatedState[team].spyMasterIndex = NO_SPY_MASTER;
        }
        var teamPlayers = gameState[team].players;
        teamPlayers.splice(teamPlayers.indexOf(sessionId), 1);
        updatedState[team].players = teamPlayers;
        await dispatch(updatedState);
    }
}

module.exports.Codenames = new Codenames();