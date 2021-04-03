const Apymon = artifacts.require("Apymon");
const BigNumber = require('bignumber.js');

contract("APYMON", async (accounts) => {
  const deployer = accounts[0];
  let instance;

  beforeEach(async () => {
    instance = await Apymon.new("", { from: deployer });
  });

  describe("Meta test", () => {
    beforeEach(async () => {
      instance = await Apymon.new("", { from: deployer });
    });

    it("name", async () => {
      const name = await instance.name();
      assert.equal(name, "Apymon");
    });

    it("symbol", async () => {
      const symbol = await instance.symbol();
      assert.equal(symbol, "APYMON");
    });

    it("initial supply", async () => {
      const supply = await instance.totalSupply();
      assert.equal(supply, 0);
    });

    it("Maximum egg supply", async () => {
      const supply = await instance.MAX_EGG_SUPPLY();
      assert.equal(supply, 6400);
    });

    it("inital balance", async () => {
      const balance = await instance.balanceOf(deployer);
      assert.equal(balance, 0);
    });

    it("initial price", async () => {
      const price = new BigNumber(await instance.getEggPrice());
      assert.equal(price.toString(10), '80000000000000000');
    });

    it("initial mintalbe count", async () => {
      const amount = await instance.getMintableCount();
      assert.equal(amount, 20);
    });

    it("initial base URI", async () => {
      const baseURI = await instance.baseURI();
      assert.equal(baseURI, "");
    });

    // it("initial token URI", async () => {
    //   const tokenURI = await instance.tokenURI(0);
    //   assert.equal(tokenURI, "");
    // });
  });
});