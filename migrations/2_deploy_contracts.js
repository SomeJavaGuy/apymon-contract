var Apymon = artifacts.require("./Apymon.sol");
var ApymonPack = artifacts.require("./ApymonPack.sol");
var ERC20Mock = artifacts.require("./test/ERC20Mock.sol");
var ERC721Mock = artifacts.require("./test/ERC721Mock.sol");
var ERC1155Mock = artifacts.require("./test/ERC1155Mock.sol");

module.exports = function (deployer) {
  deployer.deploy(Apymon, "");
  deployer.deploy(ApymonPack, Apymon.address);
  deployer.deploy(ERC20Mock);
  deployer.deploy(ERC721Mock);
  deployer.deploy(ERC1155Mock, "");
};
