'use strict';
const express = require('express');

const {HttpServer} = require('./src/http');
const {P2PServer} = require('./src/p2p');
const {Chain} = require('./src/chain');
const {NextBlock} = require('./src/block');

let chain = new Chain();

const mineBlock = (data) => {
    const newBlock = NextBlock(chain.latestBlock(), data);
    chain.add(newBlock);
    return newBlock;
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