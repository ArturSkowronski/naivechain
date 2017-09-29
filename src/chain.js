const {GenesisBlock, isValidNewBlock} = require('./block');
const {last} = require('lodash')

module.exports.Chain = class {

    constructor() {
        this.blockchain = [GenesisBlock()];
    }

    add(newBlock) {
        if (isValidNewBlock(newBlock, this.latestBlock())) {
            this.blockchain.push(newBlock)
        }
    }

    latestBlock () {return last(this.blockchain)};

    chain () {
        return this.blockchain
    }
};