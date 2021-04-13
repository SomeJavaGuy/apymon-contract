# Apymon

## Introduction
Welcome to Apymon; a decentralized NFT-based collectors experience built on the Ethereum network. Open your Genesis Egg, discover what’s inside, trade your way up and win amazing prizes.

Apymon are lab-grown creatures made by beings from another dimension who experiment with the DNA of all creatures they encounter such as Apes, Aliens, Cats and many more. Apymon are contained within egg-shaped artifacts and no creature nor egg is the same. The supply is limited at 6400 Genesis Eggs, and there is something which makes these NFTs extra special.

Do you have what it takes?
Visit [Official site](https://apymon.com/) to find out.

## How to start?

This project utilizes [Truffle Suite](https://www.trufflesuite.com/) to automate testing.

You will need to install [Truffle](https://www.trufflesuite.com/truffle):

```
npm install truffle -g
```

and [Ganache CLI](https://github.com/trufflesuite/ganache-cli):

```
npm install -g ganache-cli
```

Once installed, run Ganache CLI in a terminal:

```
My-Comp:~ johndoe$ ganache-cli
```

Then, from the root of this project, run the tests:

```
truffle test
```

## Apymon Testing

You can test Swap Bot contract by forking mainnet into local.
You will need to copy `start.sh.example` to `start.sh` in root directory.
And please add your infura id and mnemonic.

Then, from the root of this project, run the tests:

```
sh ./start.sh
```

```
truffle test
```
or

```
truffle test ./test/erc20.test.js
```

## Resources
Material related to our project is available via the following links:

[Medium](https://medium.com/@apymon)
[Twitter](https://twitter.com/ApymonOfficial)
[Discord](https://discord.gg/K2PQnsJR7h)

## AMON token

AMON governance token for Apymon holders, more details [here](https://apymon.com/amon).