const Apymon = artifacts.require("Apymon");
const BigNumber = require('bignumber.js');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const TIER1_SUPPLY = 1000;
const TIER2_SUPPLY = 2000;
const TIER3_SUPPLY = 2000;
const TIER4_SUPPLY = 1000;
const TIER5_SUPPLY = 300;
const TIER6_SUPPLY = 95;
const TIER7_SUPPLY = 5;

const TIER1_ETH = '80000000000000000000';
const TIER2_ETH = '320000000000000000000';
const TIER3_ETH = '640000000000000000000';
const TIER4_ETH = '640000000000000000000';
const TIER5_ETH = '270000000000000000000';
const TIER6_ETH = '95000000000000000000';
const TIER7_ETH = '15000000000000000000';

contract("APYMON", async (accounts) => {
    const deployer = accounts[0];
    let instance;
    let tier1EthValue = new BigNumber(0);
    let tier2EthValue = new BigNumber(0);
    let tier3EthValue = new BigNumber(0);
    let tier4EthValue = new BigNumber(0);
    let tier5EthValue = new BigNumber(0);
    let tier6EthValue = new BigNumber(0);
    let tier7EthValue = new BigNumber(0);
    let totalEthValue = new BigNumber(0);

    let tier1Supply = new BigNumber(0);
    let tier2Supply = new BigNumber(0);
    let tier3Supply = new BigNumber(0);
    let tier4Supply = new BigNumber(0);
    let tier5Supply = new BigNumber(0);
    let tier6Supply = new BigNumber(0);
    let tier7Supply = new BigNumber(0);

    beforeEach(async () => {
        instance = await Apymon.new("", { from: deployer });
        await instance.startSale();
    });

    describe("Bulk buy", () => {
        it("Buy in tier 1", async () => {
            const price = new BigNumber(await instance.getEggPrice());
            const amount = new BigNumber(await instance.getMintableCount());
            const ethValue = price.times(amount)

            for (let i = 0; i < 50; i++) {
                await instance.mintEggs(accounts[0], amount.toString(10), ZERO_ADDRESS, {
                    from: accounts[0],
                    value: ethValue.toString(10)
                });
                tier1EthValue = tier1EthValue.plus(ethValue);
                tier1Supply = tier1Supply.plus(amount);
            }
            const balance = new BigNumber(await instance.balanceOf(accounts[0]));
            assert.equal(balance.toString(10), TIER1_SUPPLY);
            assert.equal(tier1EthValue.toString(10), TIER1_ETH);
            assert.equal(tier1Supply.toString(10), TIER1_SUPPLY);
        });

        it("Buy in tier 2", async () => {
            const price = new BigNumber(await instance.getEggPrice());
            const amount = new BigNumber(await instance.getMintableCount());
            const ethValue = price.times(amount)

            for (let i = 0; i < 100; i++) {
                await instance.mintEggs(accounts[1], amount.toString(10), ZERO_ADDRESS, {
                    from: accounts[1],
                    value: ethValue.toString(10)
                });
                tier2EthValue = tier2EthValue.plus(ethValue);
                tier2Supply = tier2Supply.plus(amount);
            }
            const balance = new BigNumber(await instance.balanceOf(accounts[1]));
            assert.equal(balance.toString(10), TIER2_SUPPLY);
            assert.equal(tier2EthValue.toString(10), TIER2_ETH);
            assert.equal(tier2Supply.toString(10), TIER2_SUPPLY);
        });

        it("Buy in tier 3", async () => {
            const price = new BigNumber(await instance.getEggPrice());
            const amount = new BigNumber(await instance.getMintableCount());
            const ethValue = price.times(amount)

            for (let i = 0; i < 100; i++) {
                await instance.mintEggs(accounts[2], amount.toString(10), ZERO_ADDRESS, {
                    from: accounts[2],
                    value: ethValue.toString(10)
                });
                tier3EthValue = tier3EthValue.plus(ethValue);
                tier3Supply = tier3Supply.plus(amount);
            }
            const balance = new BigNumber(await instance.balanceOf(accounts[2]));
            assert.equal(balance.toString(10), TIER3_SUPPLY);
            assert.equal(tier3EthValue.toString(10), TIER3_ETH);
            assert.equal(tier3Supply.toString(10), TIER3_SUPPLY);
        });

        it("Buy in tier 4", async () => {
            const price = new BigNumber(await instance.getEggPrice());
            const amount = new BigNumber(await instance.getMintableCount());
            const ethValue = price.times(amount)

            for (let i = 0; i < 50; i++) {
                await instance.mintEggs(accounts[3], amount.toString(10), ZERO_ADDRESS, {
                    from: accounts[3],
                    value: ethValue.toString(10)
                });
                tier4EthValue = tier4EthValue.plus(ethValue);
                tier4Supply = tier4Supply.plus(amount);
            }
            const balance = new BigNumber(await instance.balanceOf(accounts[3]));
            assert.equal(balance.toString(10), TIER4_SUPPLY);
            assert.equal(tier4EthValue.toString(10), TIER4_ETH);
            assert.equal(tier4Supply.toString(10), TIER4_SUPPLY);
        });

        it("Buy in tier 5", async () => {
            const price = new BigNumber(await instance.getEggPrice());
            const amount = new BigNumber(await instance.getMintableCount());
            const ethValue = price.times(amount)

            for (let i = 0; i < 30; i++) {
                await instance.mintEggs(accounts[4], amount.toString(10), ZERO_ADDRESS, {
                    from: accounts[4],
                    value: ethValue.toString(10)
                });
                tier5EthValue = tier5EthValue.plus(ethValue);
                tier5Supply = tier5Supply.plus(amount);
            }
            const balance = new BigNumber(await instance.balanceOf(accounts[4]));
            assert.equal(balance.toString(10), TIER5_SUPPLY);
            assert.equal(tier5EthValue.toString(10), TIER5_ETH);
            assert.equal(tier5Supply.toString(10), TIER5_SUPPLY);
        });

        it("Buy in tier 6", async () => {
            const price = new BigNumber(await instance.getEggPrice());
            const amount = new BigNumber(await instance.getMintableCount());
            const ethValue = price.times(amount)

            for (let i = 0; i < 19; i++) {
                await instance.mintEggs(accounts[5], amount.toString(10), ZERO_ADDRESS, {
                    from: accounts[5],
                    value: ethValue.toString(10)
                });
                tier6EthValue = tier6EthValue.plus(ethValue);
                tier6Supply = tier6Supply.plus(amount);
            }
            const balance = new BigNumber(await instance.balanceOf(accounts[5]));
            assert.equal(balance.toString(10), TIER6_SUPPLY);
            assert.equal(tier6EthValue.toString(10), TIER6_ETH);
            assert.equal(tier6Supply.toString(10), TIER6_SUPPLY);
        });

        it("Buy in tier 7", async () => {
            const price = new BigNumber(await instance.getEggPrice());
            const amount = new BigNumber(await instance.getMintableCount());
            const ethValue = price.times(amount)

            for (let i = 0; i < 5; i++) {
                await instance.mintEggs(accounts[6], amount.toString(10), ZERO_ADDRESS, {
                    from: accounts[6],
                    value: ethValue.toString(10)
                });
                tier7EthValue = tier7EthValue.plus(ethValue);
                tier7Supply = tier7Supply.plus(amount);
            }
            const balance = new BigNumber(await instance.balanceOf(accounts[6]));
            assert.equal(balance.toString(10), TIER7_SUPPLY);
            assert.equal(tier7EthValue.toString(10), TIER7_ETH);
            assert.equal(tier7Supply.toString(10), TIER7_SUPPLY);
        });
    });
});