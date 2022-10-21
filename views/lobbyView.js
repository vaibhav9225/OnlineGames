$(document).ready(function() {

$('body').prepend(`
    <!-- Step 1: Ask for action -->
    <div class="ui modal" id="gameSetup">
        <div class="header">
            Create Party
        </div>
        <div class="content">
            <form class="ui form">
                <div class="field">
                    <label>Player Name</label>
                    <input type="text" placeholder="Enter your name" maxLength="10" id="creatorName">
                </div>
            </form>
        </div>
        <div class="actions">
            <div class="ui black disabled button" id="createLobby">
                Create a Party
            </div>
        </div>
        <div class="header">
            Join Party
        </div>
        <div class="content">
            <form class="ui form">
                <div class="field">
                    <label>Player Name</label>
                    <input type="text" placeholder="Enter your name" maxLength="10" id="playerName">
                </div>
                <div class="field">
                    <label>Game Code</label>
                    <input type="text" placeholder="Enter game code" id="lobbyCode">
                </div>
            </form>
        </div>
        <div class="actions">
            <div class="ui red disabled button" id="joinLobby">
                Join the Party
            </div>
        </div>
    </div>

    <!-- Step 2: Show Loader -->
    <div class="ui page dimmer" id="gameLoader">
        <div class="content">
            <div class="ui large text active loader" id="loaderText"></div>
        </div>
    </div>

    <!-- Step 3: Display Lobby -->
    <div class="ui modal" id="lobby">
        <div class="zero right margin header">
            Players in Party 
            <a class="ui black right floated medium button label" id="lobbyCodeContainer">
                Room Code
                <div class="grey detail" id="lobbyCodeLabel"></div>
                <div class="grey detail copyLabel"><i class="icon copy"></i></div>
            </a>
        </div>
        <div class="content">
            <div class="ui middle aligned large selection list" id="playersList">
                
            </div>
        </div>
        <div class="actions">
            <div class="ui red disabled button" id="startGame">
                Start Game
            </div>
        </div>
    </div>

    <!-- Step 4: Display Splash -->
    <div class="ui page dimmer" id="splash">
        <div class="content" id="splashContent">
            <div class="ui spaced image" id="splashImageContainer">
                <img src="" id="splashImage">
            </div>
        </div>
    </div>

    <!-- TEMPLATES -->
    <script id="lobbyPlayerTemplate" type="text/x-handlebars-template">
        {{#each this}}
        <div class="item">
            <img class="ui tiny avatar image" src="./avatars/{{avatarId}}.png">
            <div class="content">
                <div class="header">{{playerName}}</div>
            </div>
        </div>
        {{/each}}
    </script>
`);

});