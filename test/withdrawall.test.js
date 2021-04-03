const Apymon = artifacts.require("Apymon");
const ApymonPack = artifacts.require("ApymonPack");
const ERC20Mock = artifacts.require("ERC20Mock");
const ERC721Mock = artifacts.require("ERC721Mock");
const ERC1155Mock = artifacts.require("ERC1155Mock");
const BigNumber = require('bignumber.js');

var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract("APYMON", async (accounts) => {
    const deployer = accounts[0];
    let instanceMon;
    let instancePack;
    let instance20;
    let instance721;
    let instance1155;
    const eggId1 = 0;

    beforeEach(async () => {
        instanceMon = await Apymon.new("", { from: deployer });
        instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
        await instanceMon.setApymonPack(instancePack.address);
        instance20 = await ERC20Mock.new({ from: deployer });
        instance721 = await ERC721Mock.new({ from: deployer });
        instance1155 = await ERC1155Mock.new("", { from: deployer });
        await instanceMon.startSale();
    });

    describe("Withdraw all", () => {
        beforeEach(async () => {
            instanceMon = await Apymon.new("", { from: deployer });
            instancePack = await ApymonPack.new(instanceMon.address, { from: deployer });
            await instanceMon.setApymonPack(instancePack.address);
            instance20 = await ERC20Mock.new({ from: deployer });
            instance721 = await ERC721Mock.new({ from: deployer });
            instance1155 = await ERC1155Mock.new("", { from: deployer });
            await instanceMon.startSale();
        });

        it("Withdraw all from egg", async () => {
            const price = new BigNumber(await instanceMon.getEggPrice());
            const amount = new BigNumber(await instanceMon.getMintableCount());
            const ethValue = amount.times(price);

            await instanceMon.mintEggs(deployer, amount.toString(10), ZERO_ADDRESS, {
                from: deployer,
                value: ethValue.toString(10)
            });

            await instancePack.openEgg(eggId1);

            const balance = new BigNumber(await instanceMon.balanceOf(deployer));
            assert.equal(balance.toString(10), amount.toString(10));

            const erc20Address = instance20.address;
            const erc721Address = instance721.address;
            const erc1155Address = instance1155.address;

            // deposit erc20 token into apymon
            let erc20Balance = new BigNumber(await instance20.balanceOf(deployer));
            await instance20.approve(instancePack.address, erc20Balance.toString(10), { from: deployer });
            await instancePack.depositErc20IntoEgg(eggId1, [erc20Address], [erc20Balance.toString(10)]);

            await instance721.safeMint(deployer, 0);
            await instance721.safeMint(deployer, 1);
            await instance721.safeMint(deployer, 2);
            await instance721.safeMint(deployer, 3);
            await instance721.safeMint(deployer, 4);

            await instance721.setApprovalForAll(instancePack.address, true, { from: deployer });
            await instancePack.depositErc721IntoEgg(eggId1, erc721Address, [0, 1, 2, 3, 4]);

            await instance1155.mint(deployer, '0', '100');
            await instance1155.mint(deployer, '1', '200');

            // deposit erc1155 into apymon
            await instance1155.setApprovalForAll(instancePack.address, true, { from: deployer });
            await instancePack.depositErc1155IntoEgg(eggId1, erc1155Address, [0, 1], [100, 200]);

            await instancePack.withdrawAll(eggId1, deployer);

            // test erc20
            erc20Balance = new BigNumber(await instance20.balanceOf(deployer));
            assert.equal(erc20Balance.div(new BigNumber(10).pow(18)).toString(10), "10000000");

            const insideTokenCount = await instancePack.getInsideTokensCount(eggId1);
            assert.equal(insideTokenCount['erc20Len'], 0);
            assert.equal(insideTokenCount['erc721Len'], 0);
            assert.equal(insideTokenCount['erc1155Len'], 0);

            const insideTokens = await instancePack.getTokens(eggId1);
            assert.equal(insideTokens.tokenAddresses.length, 0);

            const erc20Token = await instancePack.getERC20Tokens(eggId1);
            assert.equal(erc20Token.addresses.length, 0);

            // test erc721
            const erc721Balance = new BigNumber(await instance721.balanceOf(deployer));
            assert.equal(erc721Balance.toString(10), '5');

            const erc721Token = await instancePack.getERC721Tokens(eggId1);
            assert.equal(erc721Token.addresses.length, 0);

            const erc721Ids = await instancePack.getERC721OrERC1155Ids(eggId1, erc721Address);
            assert.equal(erc721Ids.length, 0);

            // test erc1155
            const erc1155Balance1 = new BigNumber(await instance1155.balanceOf(deployer, 0));
            const erc1155Balance2 = new BigNumber(await instance1155.balanceOf(deployer, 1));
            assert.equal(erc1155Balance1.toString(10), '100');
            assert.equal(erc1155Balance2.toString(10), '200');

            const erc1155Token = await instancePack.getERC1155Tokens(eggId1);
            assert.equal(erc1155Token.length, 0);

            const erc1155Ids = await instancePack.getERC721OrERC1155Ids(eggId1, erc1155Address);
            assert.equal(erc1155Ids.length, 0);

            const erc1155Balances = await instancePack.getERC1155TokenBalances(eggId1, erc1155Address, [0, 1]);
            assert.equal(erc1155Balances.length, 2);
            assert.equal(erc1155Balances[0], 0);
            assert.equal(erc1155Balances[1], 0);
        });
    });
});