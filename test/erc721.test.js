const Apymon = artifacts.require("Apymon");
const ApymonPack = artifacts.require("ApymonPack");
const ERC721Mock = artifacts.require("ERC721Mock");
const BigNumber = require('bignumber.js');

var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract("APYMON", async (accounts) => {
  const deployer = accounts[0];
  let instanceMon;
  let instancePack;
  let instance721;
  const eggId1 = 0;
  const eggId2 = 1;

  beforeEach(async () => {
    instanceMon = await Apymon.new("", { from: deployer });
    instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
    await instanceMon.setApymonPack(instancePack.address);
    instance721 = await ERC721Mock.new({ from: deployer });
    await instanceMon.startSale();
  });

  describe("ERC721", () => {
    beforeEach(async () => {
      instanceMon = await Apymon.new("", { from: deployer });
      instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
      await instanceMon.setApymonPack(instancePack.address);
      instance721 = await ERC721Mock.new({ from: deployer });
      await instanceMon.startSale();
    });

    it("deposit ERC721 token into egg", async () => {
      const ownerOfApymon = accounts[0];
      const price = new BigNumber(await instanceMon.getEggPrice());
      const ethValue =  new BigNumber(2).times(price);

      // mint 2 eggs
      await instanceMon.mintEggs(ownerOfApymon, 2, ZERO_ADDRESS, {
        from: ownerOfApymon,
        value: ethValue.toString(10)
      });

      await instancePack.openEgg(eggId1);

      const erc721Address = instance721.address;

      // mint 2 erc721 mock
      await instance721.safeMint(ownerOfApymon, 0);
      await instance721.safeMint(ownerOfApymon, 1);

      // deposit erc721 into apymon
      const erc721Balance = new BigNumber(await instance721.balanceOf(ownerOfApymon));
      assert.equal(erc721Balance.toString(10), '2');

      await instance721.setApprovalForAll(
        instancePack.address,
        true,
        { from: ownerOfApymon }
      );

      await instancePack.depositErc721IntoEgg(
        eggId1,
        erc721Address,
        [0, 1]
      );
      
      const insideTokenCount = await instancePack.getInsideTokensCount(eggId1);
      assert.equal(insideTokenCount['erc20Len'], 0);
      assert.equal(insideTokenCount['erc721Len'], 1);
      assert.equal(insideTokenCount['erc1155Len'], 0);

      // get tokens by eggId
      const insideTokens = await instancePack.getTokens(eggId1);
      assert.equal(insideTokens.tokenAddresses[0], erc721Address);
      assert.equal(insideTokens.tokenTypes[0], 2);

      // get ERC721 token info
      const erc721Token = await instancePack.getERC721Tokens(eggId1);
      assert.equal(erc721Token.addresses[0], erc721Address);
      assert.equal(new BigNumber(erc721Token.tokenBalances[0]).toString(10), erc721Balance.toString(10));
    });

    it("withdraw ERC721 token from egg", async () => {
      const ownerOfApymon = accounts[0];
      const price = new BigNumber(await instanceMon.getEggPrice());
      const ethValue =  new BigNumber(2).times(price);

      // mint 2 eggs
      await instanceMon.mintEggs(ownerOfApymon, 2, ZERO_ADDRESS, {
        from: ownerOfApymon,
        value: ethValue.toString(10)
      });

      await instancePack.openEgg(eggId1);

      const erc721Address = instance721.address;

      // mint 2 erc721 mock
      await instance721.safeMint(ownerOfApymon, "0");
      await instance721.safeMint(ownerOfApymon, "1");

      let erc721Balance = new BigNumber(await instance721.balanceOf(ownerOfApymon));
      assert.equal(erc721Balance.toString(10), 2);

      // deposit erc721 into apymon

      await instance721.setApprovalForAll(
        instancePack.address,
        true,
        { from: ownerOfApymon }
      );
      await instancePack.depositErc721IntoEgg(
        eggId1,
        erc721Address,
        [0, 1]
      );

      erc721Balance = new BigNumber(await instance721.balanceOf(ownerOfApymon));
      assert.equal(erc721Balance.toString(10), 0);

      await instancePack.withdrawErc721FromEgg(eggId1, erc721Address, ['0'], ownerOfApymon);

      erc721Balance = new BigNumber(await instance721.balanceOf(ownerOfApymon));
      assert.equal(erc721Balance.toString(10), '1');
      
      let insideTokenCount = await instancePack.getInsideTokensCount(eggId1);
      assert.equal(insideTokenCount['erc20Len'], 0);
      assert.equal(insideTokenCount['erc721Len'], 1);
      assert.equal(insideTokenCount['erc1155Len'], 0);

      // get tokens by eggId
      let insideTokens = await instancePack.getTokens(eggId1);
      assert.equal(insideTokens.tokenAddresses[0], erc721Address);
      assert.equal(insideTokens.tokenTypes[0], 2);

      // get ERC721 token info
      let erc721Token = await instancePack.getERC721Tokens(eggId1);
      assert.equal(erc721Token.addresses[0], erc721Address);
      assert.equal(new BigNumber(erc721Token.tokenBalances[0]).toString(10), erc721Balance.toString(10));

      // getERC721OrERC1155Ids
      let erc721Ids = await instancePack.getERC721OrERC1155Ids(eggId1, erc721Address);
      assert.equal(erc721Ids[0], '1');

      await instancePack.withdrawErc721FromEgg(eggId1, erc721Address, ['1'], ownerOfApymon);

      erc721Balance = new BigNumber(await instance721.balanceOf(ownerOfApymon));
      assert.equal(erc721Balance.toString(10), '2');

      insideTokenCount = await instancePack.getInsideTokensCount(eggId1);
      assert.equal(insideTokenCount['erc20Len'], 0);
      assert.equal(insideTokenCount['erc721Len'], 0);
      assert.equal(insideTokenCount['erc1155Len'], 0);

      insideTokens = await instancePack.getTokens(eggId1);
      assert.equal(insideTokens.tokenAddresses.length, 0);
      assert.equal(insideTokens.tokenTypes.length, 0);

       // get ERC721 token info
       erc721Token = await instancePack.getERC20Tokens(eggId1);
       assert.equal(erc721Token.addresses.length, 0);
       assert.equal(erc721Token.tokenBalances.length, 0);

       erc721Ids = await instancePack.getERC721OrERC1155Ids(eggId1, erc721Address);
       assert.equal(erc721Ids.length, 0);
    });

    it("send ERC721 token to another egg", async () => {
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

      const erc721Address = instance721.address;

      // mint 2 erc721 mock
      await instance721.safeMint(ownerOfApymon, "0");
      await instance721.safeMint(ownerOfApymon, "1");

      let erc721Balance = new BigNumber(await instance721.balanceOf(ownerOfApymon));
      assert.equal(erc721Balance.toString(10), 2);

      // deposit erc721 into apymon

      await instance721.setApprovalForAll(instancePack.address, true, { from: ownerOfApymon });
      await instancePack.depositErc721IntoEgg(eggId1, erc721Address, [0]);
      await instancePack.depositErc721IntoEgg(eggId1, erc721Address, [1]);

      erc721Balance = new BigNumber(await instance721.balanceOf(ownerOfApymon));
      assert.equal(erc721Balance.toString(10), 0);

      await instancePack.sendErc721(eggId1, erc721Address, ['1'], eggId2);

      let insideTokenCount1 = await instancePack.getInsideTokensCount(eggId1);
      assert.equal(insideTokenCount1['erc20Len'], 0);
      assert.equal(insideTokenCount1['erc721Len'], 1);
      assert.equal(insideTokenCount1['erc1155Len'], 0);

      let insideTokenCount2 = await instancePack.getInsideTokensCount(eggId2);
      assert.equal(insideTokenCount2['erc20Len'], 0);
      assert.equal(insideTokenCount2['erc721Len'], 1);
      assert.equal(insideTokenCount2['erc1155Len'], 0);

      // get tokens by eggId
      let insideTokens1 = await instancePack.getTokens(eggId1);
      assert.equal(insideTokens1.tokenAddresses[0], erc721Address);
      assert.equal(insideTokens1.tokenTypes[0], 2);

      let insideTokens2 = await instancePack.getTokens(eggId2);
      assert.equal(insideTokens2.tokenAddresses[0], erc721Address);
      assert.equal(insideTokens2.tokenTypes[0], 2);

      // get ERC721 token info
      let erc721Token1 = await instancePack.getERC721Tokens(eggId1);
      assert.equal(erc721Token1.addresses[0], erc721Address);
      assert.equal(new BigNumber(erc721Token1.tokenBalances[0]).toString(10), '1');

      let erc721Token2 = await instancePack.getERC721Tokens(eggId2);
      assert.equal(erc721Token2.addresses[0], erc721Address);
      assert.equal(new BigNumber(erc721Token2.tokenBalances[0]).toString(10), '1');

      // getERC721OrERC1155Ids
      let erc721Ids1 = await instancePack.getERC721OrERC1155Ids(eggId1, erc721Address);
      assert.equal(new BigNumber(erc721Ids1[0]).toString(10), '0');

      let erc721Ids2 = await instancePack.getERC721OrERC1155Ids(eggId2, erc721Address);
      assert.equal(new BigNumber(erc721Ids2[0]).toString(10), '1');

      await instancePack.withdrawErc721FromEgg(eggId1, erc721Address, ['0'], ownerOfApymon);
      await instancePack.withdrawErc721FromEgg(eggId2, erc721Address, ['1'], ownerOfApymon);

      erc721Balance = new BigNumber(await instance721.balanceOf(ownerOfApymon));
      assert.equal(erc721Balance.toString(10), '2');

      insideTokenCount1 = await instancePack.getInsideTokensCount(eggId1);
      assert.equal(insideTokenCount1['erc20Len'], 0);
      assert.equal(insideTokenCount1['erc721Len'], 0);
      assert.equal(insideTokenCount1['erc1155Len'], 0);

      insideTokenCount2 = await instancePack.getInsideTokensCount(eggId2);
      assert.equal(insideTokenCount2['erc20Len'], 0);
      assert.equal(insideTokenCount2['erc721Len'], 0);
      assert.equal(insideTokenCount2['erc1155Len'], 0);

      insideTokens1 = await instancePack.getTokens(eggId1);
      assert.equal(insideTokens1.tokenAddresses.length, 0);
      assert.equal(insideTokens1.tokenTypes.length, 0);

      insideTokens2 = await instancePack.getTokens(eggId2);
      assert.equal(insideTokens2.tokenAddresses.length, 0);
      assert.equal(insideTokens2.tokenTypes.length, 0);

      // get ERC721 token info
      erc721Token1 = await instancePack.getERC20Tokens(eggId1);
      assert.equal(erc721Token1.addresses.length, 0);
      assert.equal(erc721Token1.tokenBalances.length, 0);

      erc721Token2 = await instancePack.getERC20Tokens(eggId2);
      assert.equal(erc721Token2.addresses.length, 0);
      assert.equal(erc721Token2.tokenBalances.length, 0);

      erc721Ids1 = await instancePack.getERC721OrERC1155Ids(eggId1, erc721Address);
      assert.equal(erc721Ids1.length, 0);

      erc721Ids2 = await instancePack.getERC721OrERC1155Ids(eggId2, erc721Address);
      assert.equal(erc721Ids2.length, 0);
    });
  });
});