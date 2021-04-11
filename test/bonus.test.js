const Apymon = artifacts.require("Apymon");
const ApymonPack = artifacts.require("ApymonPack");
const BigNumber = require('bignumber.js');

var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract("APYMON", async (accounts) => {
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

    it("Bonus", async () => {
      let totalEthValue = new BigNumber(0);
      let totalAmount = new BigNumber(0);

      for (let i = 0; i < 2; i++) {
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
      for (let i = 0; i < 40; i++) {
        await instancePack.openEgg(i);
        const erc20Token = await instancePack.getERC20Tokens(i);
        assert.equal(erc20Token.addresses[0], '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
        assert.equal(new BigNumber(erc20Token.tokenBalances[0]).toString(10), '8000000000000000');
      }

      const totalSupply = new BigNumber(await instanceMon.totalSupply());
      assert.equal(totalAmount.toString(10), totalSupply.toString(10));
    });
  });
});
