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
  it("Testing sending ETH to stealth address", async function () {
    const [owner] = await ethers.getSigners();
    const stealthContract = await ethers.deployContract("StealthAddress");

    // defining the arguments for the test
    const amount = '1200000000000000000'; // 1.2 ether
    const addr = '0xae4cee3b469acdcfcc104df565dcdc78e625f15b';
    const dummyKey ='0x51897b64e85c3f714bba707e867914295a1377a7463a9dae8ea6a8b914246319'; 

    // sending the ether to the stealth address
    await stealthContract.sendEthToStealthAddr(
      dummyKey,
      addr,
      { value: amount }
    );

    // check if the EphPubKey was published
    const ephPubKeys = await stealthContract.getAllEphPubKeys();
    ephPubKeys.forEach(element => {
      expect(element).to.equal(dummyKey);
    });

    // checking the balance of the stealth address
    const balance = await ethers.provider.getBalance(addr);
    expect(balance).to.equal(amount);
  });
  it("Testing sending ERC20 token to stealth address", async function() {
    const [sender] = await ethers.getSigners();
    const stealthContract = await ethers.deployContract("StealthAddress");

    // deploying the custom ERC20 token contract
    const tokenContract = await ethers.deployContract("TestToken", [sender.address]);
    const tokenContractAddr = tokenContract.target;

    // defining the arguments for the test
    const amount = '1200000000000000000'; // 1.2 ether
    const addr = '0xae4cee3b469acdcfcc104df565dcdc78e625f15b';
    const dummyKey = '0x51897b64e85c3f714bba707e867914295a1377a7463a9dae8ea6a8b914246319';

    // minting new tokens for the sender (for test purpoces)
    await tokenContract.mint(sender.address, amount);
    // approving the stealth contract to spend the given amount of tokens from the sender
    await tokenContract.approve(stealthContract.target, amount);
    
    // sending the given token to stealth address
    await stealthContract.sendTokenToStealthAddr(
      dummyKey,
      addr,
      tokenContractAddr,
      amount
    );

    // check if the EphPubKey was published
    const ephPubKeys = await stealthContract.getAllEphPubKeys();
    ephPubKeys.forEach(element => {
      expect(element).to.equal(dummyKey);
    });

    // checking the balance of the stealth address
    const tokenBalance = await tokenContract.balanceOf(addr);
    expect(tokenBalance).to.equal(amount);
  })
});
