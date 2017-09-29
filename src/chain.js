const {GenesisBlock} = require('./block');
const {last} = require('lodash')

module.exports.Chain = class {

    constructor() {
        this.blockchain = [GenesisBlock()];
    }

    add(newBlock) {
        this.blockchain.push(newBlock)
    }

    latestBlock () {return last(this.blockchain)};

    chain () {
        return this.blockchain
    }
};