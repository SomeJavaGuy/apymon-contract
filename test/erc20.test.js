const Apymon = artifacts.require("Apymon");
const ApymonPack = artifacts.require("ApymonPack");
const ERC20Mock = artifacts.require("ERC20Mock");
const BigNumber = require('bignumber.js');

var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract("ApymonPack", async (accounts) => {
  const deployer = accounts[0];
  let instanceMon;
  let instancePack;
  let instance20;
  const eggId1 = 0;
  const eggId2 = 1;

  beforeEach(async () => {
    instanceMon = await Apymon.new("", { from: deployer });
    instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
    await instanceMon.setApymonPack(instancePack.address);
    instance20 = await ERC20Mock.new({ from: deployer });
    await instanceMon.startSale();
  });

  describe("ERC20", () => {
    beforeEach(async () => {
      instanceMon = await Apymon.new("", { from: deployer });
      instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
      await instanceMon.setApymonPack(instancePack.address);
      instance20 = await ERC20Mock.new({ from: deployer });
      await instanceMon.startSale();
    });

    it("Deposit ERC20 token into egg", async () => {
      const ownerOfApymon = accounts[0];
      const price = new BigNumber(await instanceMon.getEggPrice());
      const ethValue =  new BigNumber(2).times(price);

      // mint 2 eggs
      await instanceMon.mintEggs(ownerOfApymon, 2, ZERO_ADDRESS, {
        from: ownerOfApymon,
        value: ethValue.toString(10)
      });

      await instancePack.openEgg(eggId1);

      const erc20Address = instance20.address;

      // deposit erc20 token into apymon
      const erc20Balance = new BigNumber(await instance20.balanceOf(ownerOfApymon));
      
      await instance20.approve(
        instancePack.address,
        erc20Balance.toString(10),
        { from: ownerOfApymon }
      );
      
      await instancePack.depositErc20IntoEgg(
        eggId1,
        [erc20Address],
        [erc20Balance.toString(10)],
        { from: ownerOfApymon }
      );

      const insideTokenCount = await instancePack.getInsideTokensCount(eggId1);

      assert.equal(insideTokenCount['erc20Len'], 1);
      assert.equal(insideTokenCount['erc721Len'], 0);
      assert.equal(insideTokenCount['erc1155Len'], 0);

      // get tokens by eggId
      const insideTokens = await instancePack.getTokens(eggId1);
      assert.equal(insideTokens.tokenAddresses[0], erc20Address);
      assert.equal(insideTokens.tokenTypes[0], 1);

      // get ERC20 token info
      const erc20Token = await instancePack.getERC20Tokens(eggId1);
      assert.equal(erc20Token.addresses[0], erc20Address);
      assert.equal(erc20Token.tokenBalances[0], erc20Balance.toString(10));
    });

    it("Withdraw ERC20 token from egg", async () => {
      const ownerOfApymon = accounts[0];
      const price = new BigNumber(await instanceMon.getEggPrice());
      const ethValue =  new BigNumber(2).times(price);

      // mint 2 eggs
      await instanceMon.mintEggs(ownerOfApymon, 2, ZERO_ADDRESS, {
        from: ownerOfApymon,
        value: ethValue.toString(10)
      });

      await instancePack.openEgg(eggId1);

      const erc20Address = instance20.address;

      // deposit erc20 token into apymon
      const erc20Balance = new BigNumber(await instance20.balanceOf(ownerOfApymon));
      await instance20.approve(
        instancePack.address,
        erc20Balance.toString(10),
        { from: ownerOfApymon }
      );

      await instancePack.depositErc20IntoEgg(
        eggId1,
        [erc20Address],
        [erc20Balance.toString(10)]
      );

      let erc20BalanceOfOwner = new BigNumber(await instance20.balanceOf(ownerOfApymon));
      assert.equal(erc20BalanceOfOwner.toString(10), 0);

      await instancePack.withdrawErc20FromEgg(
        eggId1,
        [erc20Address],
        ["10000"],
        ownerOfApymon
      );

      erc20BalanceOfOwner = new BigNumber(await instance20.balanceOf(ownerOfApymon));
      assert.equal(erc20BalanceOfOwner.toString(10), "10000");

      const insideTokenCount = await instancePack.getInsideTokensCount(eggId1);
      assert.equal(insideTokenCount['erc20Len'], 1);
      assert.equal(insideTokenCount['erc721Len'], 0);
      assert.equal(insideTokenCount['erc1155Len'], 0);

      // get tokens by eggId
      const insideTokens = await instancePack.getTokens(eggId1);
      assert.equal(insideTokens.tokenAddresses[0], erc20Address);
      assert.equal(insideTokens.tokenTypes[0], 1);

      // get ERC20 token info
      const erc20Token = await instancePack.getERC20Tokens(eggId1);
      assert.equal(erc20Token.addresses[0], erc20Address);
      assert.equal(new BigNumber(erc20Token.tokenBalances[0]).toString(10), erc20Balance.minus(new BigNumber(10000)).toString(10));
    });

    it("Send ERC20 token to anonter egg", async () => {
      const ownerOfApymon = accounts[0];
      const price = new BigNumber(await instanceMon.getEggPrice());
      const ethValue =  new BigNumber(2).times(price);

      // mint 2 eggs
      await instanceMon.mintEggs(ownerOfApymon, 2, ZERO_ADDRESS, {
        from: ownerOfApymon,
        value: ethValue.toString(10)
      });

      await instancePack.openEgg(eggId1);
      await instancePack.openEgg(eggId2);

      const erc20Address = instance20.address;

      // deposit erc20 token into apymon
      const erc20Balance = new BigNumber(await instance20.balanceOf(ownerOfApymon));
      await instance20.approve(
        instancePack.address,
        erc20Balance.toString(10),
        { from: ownerOfApymon }
      );

      await instancePack.depositErc20IntoEgg(
        eggId1,
        [erc20Address],
        [erc20Balance.toString(10)]
      );
      
      // send all erc20 to another egg
      await instancePack.sendErc20(
        eggId1,
        [erc20Address],
        [erc20Balance.toString(10)],
        eggId2
      );

      const insideTokenCount1 = await instancePack.getInsideTokensCount(eggId1);
      assert.equal(insideTokenCount1['erc20Len'], 0);
      assert.equal(insideTokenCount1['erc721Len'], 0);
      assert.equal(insideTokenCount1['erc1155Len'], 0);

      const insideTokenCount2 = await instancePack.getInsideTokensCount(eggId2);
      assert.equal(insideTokenCount2['erc20Len'], 1);
      assert.equal(insideTokenCount2['erc721Len'], 0);
      assert.equal(insideTokenCount2['erc1155Len'], 0);

      // get tokens by eggId
      const insideTokens1 = await instancePack.getTokens(eggId1);
      assert.equal(insideTokens1.tokenAddresses.length, 0);
      assert.equal(insideTokens1.tokenTypes.length, 0);

      const insideTokens2 = await instancePack.getTokens(eggId2);
      assert.equal(insideTokens2.tokenAddresses[0], erc20Address);
      assert.equal(insideTokens2.tokenTypes[0], 1);

      // get ERC20 token info
      const erc20Token1 = await instancePack.getERC20Tokens(eggId1);
      assert.equal(erc20Token1.addresses.length, 0);
      assert.equal(erc20Token1.tokenBalances.length, 0);

      const erc20Token2 = await instancePack.getERC20Tokens(eggId2);
      assert.equal(erc20Token2.addresses[0], erc20Address);
      assert.equal(new BigNumber(erc20Token2.tokenBalances[0]).toString(10), erc20Balance.toString(10));
    });
  });
});