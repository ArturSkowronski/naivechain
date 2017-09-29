const WebSocket = require("ws");

const p2p_port = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

module.exports.P2PServer = class {
    constructor(messageHandlers) {
        this.messageHandlers = messageHandlers;
        this.sockets = [];
        this.connectToPeers(initialPeers);
        const server = new WebSocket.Server({port: p2p_port});

        server.on('connection', ws => this.initConnection(ws));
        console.log('listening websocket p2p port on: ' + p2p_port);
    }

    listPeers() {
        return this.sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort)
    }

    connectToPeers(newPeers) {
        newPeers.forEach((peer) => {
            const ws = new WebSocket(peer);
            ws.on('open', () => this.initConnection(ws));
            ws.on('error', () => {
                console.log('connection failed')
            });
        });
    }

    initConnection(ws) {
        this.sockets.push(ws);
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        this.write(ws, this.messageHandlers.queryChainLengthMsg());
    };

    initMessageHandler(ws) {
        ws.on('message', (data) => {
                const listeners = this.messageHandlers.listenersData(ws);
                const message = JSON.parse(data);
                console.log(`Received message ${JSON.stringify(message)}`);
                listeners[message.type](message);
            }
        );
    }

    initErrorHandler(ws) {
        const closeConnection = (ws) => {
            console.log(`connection failed to peer: ${ws.url}`);
            this.sockets.splice(this.sockets.indexOf(ws), 1);
        };
        ws.on('close', () => closeConnection(ws));
        ws.on('error', () => closeConnection(ws));
    };

    write(ws, message) {
        ws.send(JSON.stringify(message))
    }

    broadcast(message) {
        if (message) {
            this.sockets.forEach(socket => this.write(socket, message))
        }

    }
}
