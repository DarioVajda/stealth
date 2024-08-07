const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StealthAddress", function () {
  it("Testing ENS registry", async function () {
    const [owner] = await ethers.getSigners();
    const deployedContract = await ethers.deployContract("StealthAddress");

    const metaAddress = {
      publicSpendingKey: "0x51897b64e85c3f714bba707e867914295a1377a7463a9dae8ea6a8b91424631921",
      publicViewingKey:"0x51897b64e85c3f714bba707e867914295a1377a7463a9dae8ea6a8b914246319fd"
    }
    const address = "0xae4cee3b469acdcfcc104df565dcdc78e625f15b";

    await deployedContract.registerMetaAddress(metaAddress);
    let res = await deployedContract.findMetaAddress(owner);
    res = {
      publicSpendingKey: res[0],
      publicViewingKey: res[1] 
    }
    console.log("Returned: ", res, typeof res);
    expect(true).to.equal(metaAddress.publicSpendingKey == res.publicSpendingKey 
        && metaAddress.publicViewingKey == res.publicViewingKey);
  });
  it("Testing sending ETH to stealth address", async function () {
    const [owner] = await ethers.getSigners();
    const stealthContract = await ethers.deployContract("StealthAddress");

    // defining the arguments for the test
    const amount = '1200000000000000000'; // 1.2 ether
    const addr = '0xae4cee3b469acdcfcc104df565dcdc78e625f15b';
    const dummyKey ='0x51897b64e85c3f714bba707e867914295a1377a7463a9dae8ea6a8b914246319d2'; 

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
    const dummyKey = '0x51897b64e85c3f714bba707e867914295a1377a7463a9dae8ea6a8b914246319ab';

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
    console.log("Lista: ", ephPubKeys);
    ephPubKeys.forEach(element => {
      expect(element).to.equal(dummyKey);
    });

    // checking the balance of the stealth address
    const tokenBalance = await tokenContract.balanceOf(addr);
    expect(tokenBalance).to.equal(amount);
  })
  /* it("Testing scanning for eph pubkeys", async function () {
    const stealthContract = await ethers.deployContract("StealthAddress");

    const dummyKey = "0x0c656e5332403213ecee5406acd97dd7f4adea786235d8c7e9edcbc7fddd66af83";

    await stealthContract.publishEphPubKey(dummyKey);
    let pubKeysList = await stealthContract.getAllEphPubKeys();
    console.log("PubKeys list: ", pubKeysList);

    await stealthContract.publishEphPubKey(dummyKey);
    await stealthContract.publishEphPubKey(dummyKey);
    pubKeysList = await stealthContract.getAllEphPubKeys();
    console.log("PubKeys list: ", pubKeysList, typeof pubKeysList);
  }); */
});
