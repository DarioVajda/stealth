const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StealthAddress", function () {
  it("Testing ENS registry", async function () {
    const [owner] = await ethers.getSigners();
    const deployedContract = await ethers.deployContract("StealthAddress");

    const metaAddress = {
      publicSpendingKey: "0x51897b64e85c3f714bba707e867914295a1377a7463a9dae8ea6a8b914246319",
      publicViewingKey:"0x51897b64e85c3f714bba707e867914295a1377a7463a9dae8ea6a8b914246319"
    }
    const address = "0xae4cee3b469acdcfcc104df565dcdc78e625f15b";

    await deployedContract.registerMetaAddress(metaAddress);
    await deployedContract.findMetaAddress(owner);
  }); 
});
