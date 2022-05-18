import Block from './models/block';
import {calculateHash} from './utils/hashing';

const GENESIS_BLOCK = new Block({
  index: 0,
  hash: 'cd2fb2ace926608315b2a5bd1bc2a259dce057a21ed63351adc0b1326da2a99e',
  previousHash: null,
  timestamp: 1652722519,
  data: 'The Genesis block!!!',
});

export class BlockChain {
  private blocks: Block[];

  constructor() {
    this.blocks = [BlockChain.GENESIS_BLOCK];
  }

  public get chainLength() {
    return this.blocks.length;
  }

  public getLatestBlock() {
    return this.blocks[this.chainLength - 1];
  }

  public generateNextBlock(data: string) {
    const {index: previousIndex, hash: previousHash} = this.getLatestBlock();
    const index = previousIndex + 1;
    const timestamp = Math.floor(Date.now() / 1000);

    const hashPayload = {
      index,
      previousHash,
      timestamp,
      data,
    };

    const hash = calculateHash(hashPayload);
    const nextBlock = new Block({
      ...hashPayload,
      hash,
    });

    this.addToChain(nextBlock);

    return nextBlock;
  }

  public replaceChain(blocks: Block[]) {
    if (!this.isValidChain(blocks) || blocks.length <= this.blocks.length) {
      console.log('Received blockchain is invalid');
      return;
    }

    console.log(
      'Received blockchain is valid. Replacing current blockchain with received blockchain'
    );

    this.blocks = blocks;
    this.broadcastChanges();
  }

  private broadcastChanges() {}

  private isValidChain(blocks: Block[]) {
    const isValidGenesisBlock =
      blocks[0].stringify === BlockChain.GENESIS_BLOCK.stringify;
    if (!isValidGenesisBlock) return false;

    for (let index = 1; index < blocks.length; index += 1) {
      const newBlock = blocks[index];
      const previousBlock = blocks[index - 1];
      if (!this.isValidNewBlock({newBlock, previousBlock})) {
        return false;
      }
    }

    return true;
  }

  private addToChain(newBlock: Block) {
    const previousBlock = this.getLatestBlock();
    const isValid = this.isValidNewBlock({newBlock, previousBlock});
    if (!isValid) return;

    this.blocks.push(newBlock);
  }

  private calculateHashForBlock(block: Block) {
    return calculateHash(block.hashPayload);
  }

  private isValidNewBlock({
    newBlock,
    previousBlock,
  }: {
    newBlock: Block;
    previousBlock: Block;
  }) {
    return (
      newBlock.isValidBlockStructure &&
      previousBlock.index + 1 === newBlock.index &&
      previousBlock.hash === newBlock.previousHash &&
      newBlock.hash === this.calculateHashForBlock(newBlock)
    );
  }

  public static GENESIS_BLOCK = GENESIS_BLOCK;
}

export default BlockChain;
