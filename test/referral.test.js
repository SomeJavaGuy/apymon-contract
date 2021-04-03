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

    it("Referral", async () => {
      let totalEthValue = new BigNumber(0);
      let totalAmount = new BigNumber(0);

      for (let i = 0; i < 10; i++) {
        const price = new BigNumber(await instanceMon.getEggPrice());
        const amount = new BigNumber(await instanceMon.getMintableCount());
        const ethValue =  price.times(amount);

        await instanceMon.mintEggs(accounts[i], amount.toString(10), ZERO_ADDRESS, {
          from: accounts[i],
          value: ethValue.toString(10)
        });
        const balance = new BigNumber(await instanceMon.balanceOf(accounts[i]));
        assert.equal(balance.toString(10), amount.toString(10));
        totalEthValue = totalEthValue.plus(ethValue);
        totalAmount = totalAmount.plus(amount);
      }

      for (let i = 0; i < 10; i++) {
        const price = new BigNumber(await instanceMon.getEggPrice());
        const amount = new BigNumber(await instanceMon.getMintableCount());
        const ethValue =  price.times(amount);
        const referre = i === 9 ? accounts[0] : accounts[i + 1];

        await instanceMon.mintEggs(accounts[i], amount.toString(10), referre, {
          from: accounts[i],
          value: ethValue.toString(10)
        });
        const balance = new BigNumber(await instanceMon.balanceOf(accounts[i]));
        assert.equal(balance.toString(10), amount.times(new BigNumber(2)).toString(10));
        totalEthValue = totalEthValue.plus(ethValue);
        totalAmount = totalAmount.plus(amount);
      }

      // In this point, total supply should be 400 and 10% of 400 will go to referral bonus
      const referralAmount = totalEthValue.div(new BigNumber(10));
      for (let i = 0; i < 10; i++) {
        const refereeAmount = new BigNumber(await instanceMon._referralAmounts(accounts[i]));
        assert.equal(refereeAmount.toString(10), referralAmount.div(new BigNumber(10)).toString(10));
      }

      await instanceMon.pauseSale();

      await instanceMon.distributeReferral(0, 199);
      for (let i = 0; i < 200; i++) {
        await instancePack.openEgg(i);
        const erc20Token = await instancePack.getERC20Tokens(i);
        assert.equal(erc20Token.addresses[0], '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
        assert.equal(new BigNumber(erc20Token.tokenBalances[0]).toString(10), '16000000000000000');
      }

      await instanceMon.distributeReferral(200, 399);
      for (let j = 200; j < 400; j++) {
        await instancePack.openEgg(j);
        const erc20Token = await instancePack.getERC20Tokens(j);
        assert.equal(erc20Token.addresses.length, '0');
      }

      const totalSupply = new BigNumber(await instanceMon.totalSupply());
      assert.equal(totalAmount.toString(10), totalSupply.toString(10));

      const totalRaisedEth = new BigNumber(await web3.eth.getBalance(instanceMon.address));
      assert.equal(totalEthValue.minus(referralAmount).toString(10), totalRaisedEth.toString(10));
    });
  });
});
