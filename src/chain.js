const {GenesisBlock} = require('./block');

module.exports.Chain = class {

    constructor() {
        this.blockchain = [GenesisBlock()];
    }

    chain() {
        return this.blockchain
    }
};