const { Lobby } = require('Lobby');

const shuffle = array => {
    var j, x, i;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
};

const AVATAR_COUNT = 14;

const getAvatarSet = () => {
    const avatarSet = new Set();
    for (var i = 1; i <= AVATAR_COUNT; i++) {
        avatarSet.add(i);
    }
    return avatarSet;
};

class Avatar {
    async getAvator(lobbyCode) {
        const avatarSet = getAvatarSet();
        const results = await Lobby.getPlayers(lobbyCode);
        const assignedAvatars = results.Items.map(player => player.avatarId);
        for (var avatarId of assignedAvatars) {
            avatarSet.delete(avatarId);
        }
        const avatarIds = shuffle(Array.from(avatarSet));
        return avatarIds[0];
    }
}

module.exports.Avatar = new Avatar();