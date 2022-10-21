const SOCKET_URL = 'wss://9zc0v0lwud.execute-api.us-east-2.amazonaws.com/prod';

var socket = null;
var onSocketOpen = () => {};
var messageHandlers = {};

const onMessage = event => {
    const data = JSON.parse(event.data);
    const action = data.action;
    const handler = messageHandlers[action];
    if (typeof handler !== 'undefined') {
        handler(data);
    }
};

const setupConnection = () => {
    socket = new WebSocket(SOCKET_URL);
    socket.onopen = onSocketOpen;
    socket.onmessage = onMessage;
};

const sendMessage = payload => {
    socket.send(JSON.stringify(payload));
};