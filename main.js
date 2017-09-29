'use strict';
const express = require('express');

const {HttpServer} = require('./src/http');
const {P2PServer} = require('./src/p2p');

const p2pServer = new P2PServer();
const httpServer = new HttpServer((router) => {
    router.get('/peers', (req, res) => res.send(p2pServer.listPeers()));

    router.post('/addPeer', (req, res) => {
        p2pServer.connectToPeers(req.body.peer);
        res.send();
    });
});