const {GenesisBlock, isValidNewBlock} = require('./block');
const {last, head} = require('lodash');

module.exports.Chain = class {
    constructor(originalChain) {
        if(originalChain){
            this.blockchain = cloneDeep(originalChain)
        } else {
            this.blockchain = [GenesisBlock()];
        }
    }

    chain() {
        return this.blockchain
    }

    latestBlock () {return last(this.blockchain)};

    add(newBlock) {
        if (isValidNewBlock(newBlock, this.latestBlock())) {
            this.blockchain.push(newBlock)
        }
    }

    size(){
        return this.blockchain.length;
    }

    get(i) {
        return this.blockchain[i];

    }

    genesisBlock(){
        return head(this.blockchain)
    }
};