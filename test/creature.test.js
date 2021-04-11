const Apymon = artifacts.require("Apymon");
const ApymonPack = artifacts.require("ApymonPack");
const BigNumber = require('bignumber.js');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const mintTimes = 2;

contract("APYMONPACK", async (accounts) => {
  const deployer = accounts[0];
  let instanceMon;
  let instancePack;

  beforeEach(async () => {
    instanceMon = await Apymon.new("", { from: deployer });
    instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
    await instanceMon.setApymonPack(instancePack.address);
    await instanceMon.startSale();
  });

  describe("Functionality", () => {

    beforeEach(async () => {
      instanceMon = await Apymon.new("", { from: deployer });
      instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
      await instanceMon.setApymonPack(instancePack.address);
      await instanceMon.startSale();
    });

    it("Creature", async () => {
      let totalEthValue = new BigNumber(0);
      let totalAmount = new BigNumber(0);

      for (let i = 0; i < mintTimes; i++) {
        const price = new BigNumber(await instanceMon.getEggPrice());
        const amount = new BigNumber(await instanceMon.getMintableCount());
        const ethValue =  price.times(amount);

        await instanceMon.mintEggs(accounts[0], amount.toString(10), ZERO_ADDRESS, {
          from: accounts[0],
          value: ethValue.toString(10)
        });
        totalEthValue = totalEthValue.plus(ethValue);
        totalAmount = totalAmount.plus(amount);
      }

      await instanceMon.pauseSale();

      await instanceMon.distributeBonus(0, 39);
      await instanceMon.distributeBonus(40, 20 * mintTimes - 1);
      for (let i = 0; i < 20 * mintTimes; i++) {
        await instancePack.openEgg(i);
        const erc20Token = await instancePack.getERC20Tokens(i);
        assert.equal(erc20Token.addresses[0], '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
        assert.equal(new BigNumber(erc20Token.tokenBalances[0]).toString(10), '8000000000000000');
      }
      let totalSupply = new BigNumber(await instanceMon.totalSupply());
      assert.equal(totalAmount.toString(10), totalSupply.toString(10));

      // mint creatures
      await instanceMon.mintCreatures(20 * mintTimes);

      totalSupply = new BigNumber(await instanceMon.totalSupply());
      assert.equal(totalAmount.times(new BigNumber(2)).toString(10), totalSupply.toString(10));

      await instancePack.depositCreaturesIntoEggs(0, 19);

      await instancePack.depositCreaturesIntoEggs(20, 20 * mintTimes - 1);

      for (let i = 0; i < 20 * mintTimes; i++) {
        const erc721Token = await instancePack.getERC721Tokens(i);
        assert.equal(erc721Token.addresses[0], instanceMon.address);
        assert.equal(new BigNumber(erc721Token.tokenBalances[0]).toString(10), '1');
      }
    });
  });
});
