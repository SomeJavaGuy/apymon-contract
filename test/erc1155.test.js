const Apymon = artifacts.require("Apymon");
const ApymonPack = artifacts.require("ApymonPack");
const ERC1155Mock = artifacts.require("ERC1155Mock");
const BigNumber = require('bignumber.js');

var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract("APYMON", async (accounts) => {
    const deployer = accounts[0];
    let instanceMon;
    let instancePack;
    let instance1155;
    const eggId1 = 0;
    const eggId2 = 1;
    const eggId3 = 2;

    beforeEach(async () => {
        instanceMon = await Apymon.new("", { from: deployer });
        instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
        await instanceMon.setApymonPack(instancePack.address);
        instance1155 = await ERC1155Mock.new("", { from: deployer });
        await instanceMon.startSale();
    });

    describe("ERC1155", () => {
        beforeEach(async () => {
            instanceMon = await Apymon.new("", { from: deployer });
            instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
            await instanceMon.setApymonPack(instancePack.address);
            instance1155 = await ERC1155Mock.new("", { from: deployer });
            await instanceMon.startSale();
        });

        it("deposit ERC1155 token into egg", async () => {
            const ownerOfApymon = accounts[0];
            const price = new BigNumber(await instanceMon.getEggPrice());
            const ethValue = new BigNumber(2).times(price);

            // mint 2 eggs
            await instanceMon.mintEggs(ownerOfApymon, 2, ZERO_ADDRESS, {
                from: ownerOfApymon,
                value: ethValue.toString(10)
            });

            await instancePack.openEgg(eggId1);

            const erc1155Address = instance1155.address;

            // mint 2 erc1155 mock
            await instance1155.mint(ownerOfApymon, '0', '100');
            await instance1155.mint(ownerOfApymon, '1', '200');

            // deposit erc1155 into apymon
            let erc1155Balance1 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 0));
            let erc1155Balance2 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 1));
            assert.equal(erc1155Balance1.toString(10), '100');
            assert.equal(erc1155Balance2.toString(10), '200');

            await instance1155.setApprovalForAll(instancePack.address, true, { from: ownerOfApymon });
            await instancePack.depositErc1155IntoEgg(eggId1, erc1155Address, [0, 1], [100, 200]);

            const insideTokenCount = await instancePack.getInsideTokensCount(eggId1);
            assert.equal(insideTokenCount['erc20Len'], 0);
            assert.equal(insideTokenCount['erc721Len'], 0);
            assert.equal(insideTokenCount['erc1155Len'], 1);

            // get tokens by eggId
            const insideTokens = await instancePack.getTokens(eggId1);
            assert.equal(insideTokens.tokenAddresses[0], erc1155Address);
            assert.equal(insideTokens.tokenTypes[0], 3);

            // get ERC1155 token info
            const erc1155Token = await instancePack.getERC1155Tokens(eggId1);
            assert.equal(erc1155Token[0], erc1155Address);

            // getERC721OrERC1155Ids
            let erc1155Ids = await instancePack.getERC721OrERC1155Ids(eggId1, erc1155Address);
            assert.equal(erc1155Ids.length, 2);
            assert.equal(erc1155Ids[0], 0);
            assert.equal(erc1155Ids[1], 1);

            // getERC1155TokenBalances
            const erc1155Balances = await instancePack.getERC1155TokenBalances(
                eggId1,
                erc1155Address,
                [erc1155Ids[0].toNumber(), erc1155Ids[1].toNumber()]
            );
            assert.equal(erc1155Balances[0], '100');
            assert.equal(erc1155Balances[1], '200');
        });

        it("withdraw ERC1155 token from egg", async () => {
            const ownerOfApymon = accounts[0];
            const price = new BigNumber(await instanceMon.getEggPrice());
            const ethValue = new BigNumber(2).times(price);

            // mint 2 eggs
            await instanceMon.mintEggs(ownerOfApymon, 2, ZERO_ADDRESS, {
                from: ownerOfApymon,
                value: ethValue.toString(10)
            });

            await instancePack.openEgg(eggId1);
            await instancePack.openEgg(eggId2);

            const erc1155Address = instance1155.address;

            // mint 2 erc1155 mock
            await instance1155.mint(ownerOfApymon, '0', '100');
            await instance1155.mint(ownerOfApymon, '1', '200');

            let erc1155Balance1 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 0));
            let erc1155Balance2 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 1));
            assert.equal(erc1155Balance1.toString(10), '100');
            assert.equal(erc1155Balance2.toString(10), '200');

            // deposit erc721 into apymon

            await instance1155.setApprovalForAll(instancePack.address, true, { from: ownerOfApymon });
            await instancePack.depositErc1155IntoEgg(eggId1, erc1155Address, [0], [100]);
            await instancePack.depositErc1155IntoEgg(eggId2, erc1155Address, [1], [200]);

            let insideTokenCount1 = await instancePack.getInsideTokensCount(eggId1);
            let insideTokenCount2 = await instancePack.getInsideTokensCount(eggId2);
            assert.equal(insideTokenCount1['erc20Len'], 0);
            assert.equal(insideTokenCount1['erc721Len'], 0);
            assert.equal(insideTokenCount1['erc1155Len'], 1);

            assert.equal(insideTokenCount2['erc20Len'], 0);
            assert.equal(insideTokenCount2['erc721Len'], 0);
            assert.equal(insideTokenCount2['erc1155Len'], 1);

            erc1155Balance1 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 0));
            erc1155Balance2 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 1));
            assert.equal(erc1155Balance1.toString(10), '0');
            assert.equal(erc1155Balance2.toString(10), '0');

            await instancePack.withdrawErc1155FromEgg(eggId1, erc1155Address, ['0'], ['50'], ownerOfApymon);
            await instancePack.withdrawErc1155FromEgg(eggId2, erc1155Address, ['1'], ['200'], ownerOfApymon);

            erc1155Balance1 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 0));
            erc1155Balance2 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 1));
            assert.equal(erc1155Balance1.toString(10), '50');
            assert.equal(erc1155Balance2.toString(10), '200');

            insideTokenCount1 = await instancePack.getInsideTokensCount(eggId1);
            insideTokenCount2 = await instancePack.getInsideTokensCount(eggId2);
            assert.equal(insideTokenCount1['erc20Len'], 0);
            assert.equal(insideTokenCount1['erc721Len'], 0);
            assert.equal(insideTokenCount1['erc1155Len'], 1);

            assert.equal(insideTokenCount2['erc20Len'], 0);
            assert.equal(insideTokenCount2['erc721Len'], 0);
            assert.equal(insideTokenCount2['erc721Len'], 0);

            // get tokens by eggId
            let insideTokens1 = await instancePack.getTokens(eggId1);
            let insideTokens2 = await instancePack.getTokens(eggId2);
            assert.equal(insideTokens1.tokenAddresses[0], erc1155Address);
            assert.equal(insideTokens1.tokenTypes[0], 3);

            assert.equal(insideTokens2.tokenAddresses.length, 0);
            assert.equal(insideTokens2.tokenTypes.length, 0);

            // get ERC1155 token info
            let erc1155Token1 = await instancePack.getERC1155Tokens(eggId1);
            let erc1155Token2 = await instancePack.getERC1155Tokens(eggId2);
            assert.equal(erc1155Token1[0], erc1155Address);
            assert.equal(erc1155Token2.length, 0);

            // getERC721OrERC1155Ids
            let erc1155Ids1 = await instancePack.getERC721OrERC1155Ids(eggId1, erc1155Address);
            let erc1155Ids2 = await instancePack.getERC721OrERC1155Ids(eggId2, erc1155Address);
            assert.equal(erc1155Ids1[0], 0);
            assert.equal(erc1155Ids2.length, 0);

            // getERC1155TokenBalance
            const erc1155Balances = await instancePack.getERC1155TokenBalances(eggId1, erc1155Address, [0, 1]);
            assert.equal(erc1155Balances[0], '50');
            assert.equal(erc1155Balances[1], '0');
        });

        it("send ERC1155 token to another egg", async () => {
            const ownerOfApymon = accounts[0];
            const price = new BigNumber(await instanceMon.getEggPrice());
            const ethValue = new BigNumber(3).times(price);

            // mint 3 eggs
            await instanceMon.mintEggs(ownerOfApymon, 3, ZERO_ADDRESS, {
                from: ownerOfApymon,
                value: ethValue.toString(10)
            });

            await instancePack.openEgg(eggId1);
            await instancePack.openEgg(eggId2);
            await instancePack.openEgg(eggId3);

            const erc1155Address = instance1155.address;

            // mint 2 erc1155 mock
            await instance1155.mint(ownerOfApymon, '0', '200');
            await instance1155.mint(ownerOfApymon, '1', '200');

            // deposit erc1155 into apymon
            await instance1155.setApprovalForAll(instancePack.address, true, { from: ownerOfApymon });
            await instancePack.depositErc1155IntoEgg(eggId1, erc1155Address, [0], [200]);
            await instancePack.depositErc1155IntoEgg(eggId2, erc1155Address, [1], [200]);

            await instancePack.sendErc1155(eggId1, erc1155Address, ['0'], ['100'], eggId2);
            await instancePack.sendErc1155(eggId2, erc1155Address, ['1'], ['100'], eggId3);

            let insideTokenCount1 = await instancePack.getInsideTokensCount(eggId1);
            let insideTokenCount2 = await instancePack.getInsideTokensCount(eggId2);
            let insideTokenCount3 = await instancePack.getInsideTokensCount(eggId3);
            assert.equal(insideTokenCount1['erc20Len'], 0);
            assert.equal(insideTokenCount1['erc721Len'], 0);
            assert.equal(insideTokenCount1['erc1155Len'], 1);

            assert.equal(insideTokenCount2['erc20Len'], 0);
            assert.equal(insideTokenCount2['erc721Len'], 0);
            assert.equal(insideTokenCount2['erc1155Len'], 1);

            assert.equal(insideTokenCount3['erc20Len'], 0);
            assert.equal(insideTokenCount3['erc721Len'], 0);
            assert.equal(insideTokenCount3['erc1155Len'], 1);

            // get tokens by eggId
            let insideTokens1 = await instancePack.getTokens(eggId1);
            let insideTokens2 = await instancePack.getTokens(eggId2);
            let insideTokens3 = await instancePack.getTokens(eggId3);
            assert.equal(insideTokens1.tokenAddresses[0], erc1155Address);
            assert.equal(insideTokens1.tokenTypes[0], 3);

            assert.equal(insideTokens2.tokenAddresses[0], erc1155Address);
            assert.equal(insideTokens2.tokenTypes[0], 3);

            assert.equal(insideTokens3.tokenAddresses[0], erc1155Address);
            assert.equal(insideTokens3.tokenTypes[0], 3);

            // get ERC1155 token info
            let erc1155Token1 = await instancePack.getERC1155Tokens(eggId1);
            let erc1155Token2 = await instancePack.getERC1155Tokens(eggId2);
            let erc1155Token3 = await instancePack.getERC1155Tokens(eggId3);
            assert.equal(erc1155Token1[0], erc1155Address);
            assert.equal(erc1155Token2[0], erc1155Address);
            assert.equal(erc1155Token3[0], erc1155Address);

            // getERC721OrERC1155Ids
            let erc1155Ids1 = await instancePack.getERC721OrERC1155Ids(eggId1, erc1155Address);
            let erc1155Ids2 = await instancePack.getERC721OrERC1155Ids(eggId2, erc1155Address);
            let erc1155Ids3 = await instancePack.getERC721OrERC1155Ids(eggId3, erc1155Address);

            assert.equal(new BigNumber(erc1155Ids1[0]).toString(10), '0');
            assert.equal(new BigNumber(erc1155Ids2[0]).toString(10), '1');
            assert.equal(new BigNumber(erc1155Ids2[1]).toString(10), '0');
            assert.equal(new BigNumber(erc1155Ids3[0]).toString(10), '1');

            // getERC1155TokenBalance
            let erc1155Balance1 = await instancePack.getERC1155TokenBalances(eggId1, erc1155Address, [0]);
            let erc1155Balance2 = await instancePack.getERC1155TokenBalances(eggId2, erc1155Address, [0, 1]);
            let erc1155Balance4 = await instancePack.getERC1155TokenBalances(eggId3, erc1155Address, [1]);

            assert.equal(erc1155Balance1[0], '100');
            assert.equal(erc1155Balance2[0], '100');
            assert.equal(erc1155Balance2[1], '100');
            assert.equal(erc1155Balance4[0], '100');

            await instancePack.withdrawErc1155FromEgg(eggId1, erc1155Address, ['0'], ['100'], ownerOfApymon);
            await instancePack.withdrawErc1155FromEgg(eggId2, erc1155Address, ['1'], ['100'], ownerOfApymon);
            await instancePack.withdrawErc1155FromEgg(eggId3, erc1155Address, ['1'], ['50'], ownerOfApymon);

            erc1155Balance1 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 0));
            erc1155Balance2 = new BigNumber(await instance1155.balanceOf(ownerOfApymon, 1));
            assert.equal(erc1155Balance1.toString(10), '100');
            assert.equal(erc1155Balance2.toString(10), '150');

            insideTokenCount1 = await instancePack.getInsideTokensCount(eggId1);
            insideTokenCount2 = await instancePack.getInsideTokensCount(eggId2);
            insideTokenCount3 = await instancePack.getInsideTokensCount(eggId3);
            assert.equal(insideTokenCount1['erc20Len'], 0);
            assert.equal(insideTokenCount1['erc721Len'], 0);
            assert.equal(insideTokenCount1['erc1155Len'], 0);

            assert.equal(insideTokenCount2['erc20Len'], 0);
            assert.equal(insideTokenCount2['erc721Len'], 0);
            assert.equal(insideTokenCount2['erc1155Len'], 1);

            assert.equal(insideTokenCount3['erc20Len'], 0);
            assert.equal(insideTokenCount3['erc721Len'], 0);
            assert.equal(insideTokenCount3['erc1155Len'], 1);

            // get tokens by eggId
            insideTokens1 = await instancePack.getTokens(eggId1);
            insideTokens2 = await instancePack.getTokens(eggId2);
            insideTokens3 = await instancePack.getTokens(eggId3);
            assert.equal(insideTokens1.tokenAddresses.length, '0');
            assert.equal(insideTokens1.tokenTypes.length, 0);

            assert.equal(insideTokens2.tokenAddresses[0], erc1155Address);
            assert.equal(insideTokens2.tokenTypes[0], 3);

            assert.equal(insideTokens3.tokenAddresses[0], erc1155Address);
            assert.equal(insideTokens3.tokenTypes[0], 3);

            // get ERC1155 token info
            erc1155Token1 = await instancePack.getERC1155Tokens(eggId1);
            erc1155Token2 = await instancePack.getERC1155Tokens(eggId2);
            erc1155Token3 = await instancePack.getERC1155Tokens(eggId3);
            assert.equal(erc1155Token1.length, '0');
            assert.equal(erc1155Token2[0], erc1155Address);
            assert.equal(erc1155Token3[0], erc1155Address);

            // getERC721OrERC1155Ids
            erc1155Ids1 = await instancePack.getERC721OrERC1155Ids(eggId1, erc1155Address);
            erc1155Ids2 = await instancePack.getERC721OrERC1155Ids(eggId2, erc1155Address);
            erc1155Ids3 = await instancePack.getERC721OrERC1155Ids(eggId3, erc1155Address);

            assert.equal(new BigNumber(erc1155Ids1.length).toString(10), '0');
            assert.equal(new BigNumber(erc1155Ids2[0]).toString(10), '0');
            assert.equal(new BigNumber(erc1155Ids3[0]).toString(10), '1');

            // getERC1155TokenBalance
            erc1155Balance1 = await instancePack.getERC1155TokenBalances(eggId1, erc1155Address, [0]);
            erc1155Balance2 = await instancePack.getERC1155TokenBalances(eggId2, erc1155Address, [0, 1]);
            erc1155Balance4 = await instancePack.getERC1155TokenBalances(eggId3, erc1155Address, [1]);

            assert.equal(erc1155Balance1[0], '0');
            assert.equal(erc1155Balance2[0], '100');
            assert.equal(erc1155Balance2[1], '0');
            assert.equal(erc1155Balance4[0], '50');
        });
    });
});