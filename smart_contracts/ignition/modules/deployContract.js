const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StealthAddressModule", (m) => {
  const deployedContract = m.contract("StealthAddress");

  return { deployedContract };
});
