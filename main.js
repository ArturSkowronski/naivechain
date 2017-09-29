'use strict';
const express = require('express');

const {HttpServer} = require('./src/http');
const {P2PServer} = require('./src/p2p');
const {Chain} = require('./src/chain');
const {NextBlock} = require('./src/block');
const {last} = require('lodash');

let chain = new Chain();

const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

const handlers = {
    queryChainLengthMsg: () => ({'type': MessageType.QUERY_LATEST}),
    responseLatestMsg: () => ({
        'type': MessageType.RESPONSE_BLOCKCHAIN,
        'data': JSON.stringify([chain.latestBlock()])
    }),
    responseChainMsg: () => ({
        'type': MessageType.RESPONSE_BLOCKCHAIN,
        'data': JSON.stringify(chain.chain())
    }),
    listenersData: ws => {
        return {
            [MessageType.QUERY_LATEST]: () => p2pServer.write(ws, handlers.responseLatestMsg()),
            [MessageType.QUERY_ALL]: () => p2pServer.write(ws, handlers.responseChainMsg()),
            [MessageType.RESPONSE_BLOCKCHAIN]: (message) => {
                p2pServer.broadcast(handleBlockchainResponse(message))
            },
        }
    }
};

const mineBlock = (data) => {
    const newBlock = NextBlock(chain.latestBlock(), data);
    chain.add(newBlock);
    p2pServer.broadcast(handlers.responseLatestMsg());

    return newBlock;
};


const replaceChain = (newBlockchain) => {
    if (newBlockchain.isValidChain() && newBlockchain.size() > chain.size()) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        chain = newBlockchain;
        return handlers.responseLatestMsg();
    } else {
        console.log('Received blockchain invalid');
    }
};

const handleBlockchainResponse = (message) => {
    const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    const latestBlockReceived = last(receivedBlocks);
    const latestBlockHeld = chain.latestBlock();

    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log(`blockchain possibly behind. We got: ${latestBlockHeld.index} Peer got: ${latestBlockReceived.index}`);

        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            chain.add(latestBlockReceived);
            return handlers.responseLatestMsg();
        }

        if (receivedBlocks.length === 1) {
            console.log("It's part of not known chain. Ask for whole");
            return {'type': MessageType.QUERY_ALL};
        }

        console.log("Received blockchain is longer than current blockchain");

        replaceChain(newBlockchain);

        return handlers.responseLatestMsg();
    } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};

const p2pServer = new P2PServer(handlers);
const httpServer = new HttpServer((router) => {
    router.get('/peers', (req, res) => res.send(p2pServer.listPeers()));

    router.post('/mineBlock', (req, res) => {
        const newBlock = mineBlock(req.body.data);
        console.log(`block added: ${JSON.stringify(newBlock)}`);
        res.send();
    });

    router.post('/addPeer', (req, res) => {
        p2pServer.connectToPeers(req.body.peer);
        res.send();
    });
});