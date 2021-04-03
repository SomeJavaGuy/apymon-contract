const Apymon = artifacts.require("Apymon");
const BigNumber = require('bignumber.js');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract("APYMON", async (accounts) => {
  const deployer = accounts[0];
  let instance;

  beforeEach(async () => {
    instance = await Apymon.new("", { from: deployer });
  });

  describe("Mint APYMON", () => {
    beforeEach(async () => {
      instance = await Apymon.new("", { from: deployer });
    });

    it("Mint eggs", async () => {
      const referee = accounts[1];
      const referrer = accounts[0];

      const price = new BigNumber(await instance.getEggPrice());
      const amount = new BigNumber(await instance.getMintableCount());
      const ethValue =  amount.times(price);

      await instance.startSale();

      await instance.mintEggs(referee, amount.toString(10), ZERO_ADDRESS, {
        from: referee,
        value: ethValue.toString(10)
      });

      const balance = new BigNumber(await instance.balanceOf(referee));
      assert.equal(balance.toString(10), amount.toString(10));

      for (let i = 0; i < amount.toNumber(); i++) {
        const owner = await instance.ownerOf(i);
        assert.equal(owner, referee);
      }

      await instance.mintEggs(referrer, amount.toString(10), referee, {
        from: referrer,
        value: ethValue.toString(10)
      });

      const refereeAmount = new BigNumber(await instance._referralAmounts(referee));
      const referrerAmount = new BigNumber(await instance._referralAmounts(referrer));
      const referralStatus = await instance._referralStatus(referrer, referee);

      assert.equal(refereeAmount.toString(10), ethValue.div(new BigNumber(10)).toString(10));
      assert.equal(referrerAmount.toString(10), ethValue.div(new BigNumber(10)).toString(10));
      assert.equal(referralStatus, true);
    });
  });
});