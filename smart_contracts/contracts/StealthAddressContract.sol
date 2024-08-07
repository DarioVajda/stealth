// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import "hardhat/console.sol";

contract StealthAddress {

    struct MetaAddress {
        uint256 publicSpendingKey;       // K
        uint256 publicViewingKey;        // V
    }

    error StealthAddress__BadBaseAddress();

    mapping(address => MetaAddress) ENS;

    function registerMetaAddress(MetaAddress calldata metaAddress) public {
        ENS[msg.sender] = metaAddress;
    }

    function findMetaAddress(address baseAddress) public view returns (MetaAddress memory) {
        if (ENS[baseAddress].publicSpendingKey == 0 && ENS[baseAddress].publicViewingKey == 0) {
            revert StealthAddress__BadBaseAddress();
        }
        return ENS[baseAddress];
    }
}
