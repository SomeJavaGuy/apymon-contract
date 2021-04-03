const Apymon = artifacts.require("Apymon");
const BigNumber = require('bignumber.js');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const TEAM_ADDRESS = "0x23F40f52b2171A81355eA8fea03Fa8F0FbB0Dd68";

contract("APYMON", async (accounts) => {
  const deployer = accounts[0];
  let instance;

  beforeEach(async () => {
    instance = await Apymon.new("", { from: deployer });
    await instance.startSale();
  });

  describe("Functionality", () => {
    beforeEach(async () => {
      instance = await Apymon.new("", { from: deployer });
      await instance.startSale();
    });

    it("Request team fund", async () => {
        const price = new BigNumber(await instance.getEggPrice());
        const amount = new BigNumber(await instance.getMintableCount());
        const ethValue = price.times(amount);
        let raisedEth = new BigNumber(0);

        for (let i = 0; i < 10; i++) {
            await instance.mintEggs(accounts[0], amount.toString(10), ZERO_ADDRESS, {
                from: accounts[0],
                value: ethValue.toString(10)
            });
            raisedEth = raisedEth.plus(ethValue);
        }
        const finalRaisedEth = new BigNumber(await web3.eth.getBalance(instance.address));
        assert.equal(raisedEth.toString(10), finalRaisedEth.toString(10));
        
        await instance.requestTeamFund(finalRaisedEth.toString(10));

        const teamBalance = new BigNumber(await web3.eth.getBalance(TEAM_ADDRESS));
        assert.equal(teamBalance.toString(10), finalRaisedEth.div(new BigNumber(2)).toString(10));
    });
  });
});