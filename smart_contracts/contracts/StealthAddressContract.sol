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
        
        // for testing
        console.log(
            "Recieved meta address with following keys:\n%d\n%d\n", 
            metaAddress.publicSpendingKey, 
            metaAddress.publicViewingKey
        );
    }

    function findMetaAddress(address baseAddress) public view returns (MetaAddress memory) {
        if (ENS[baseAddress].publicSpendingKey == 0 && ENS[baseAddress].publicViewingKey == 0) {
            revert StealthAddress__BadBaseAddress();
        }

        // for testing
        console.log("Meta-address for the given address is:\n%d\n%d\n",
            ENS[baseAddress].publicSpendingKey, 
            ENS[baseAddress].publicViewingKey
        );

        return ENS[baseAddress];
    }
}
