// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import "hardhat/console.sol";

contract StealthAddress {

    struct MetaAddress {
        uint256 publicSpendingKey;       // K
        uint256 publicViewingKey;        // V
    }

    uint ephCounter;

    mapping(uint256 => uint256) public ephPubKeyRegistry;
    mapping(address => MetaAddress) metaAddressRegistry;
    
    error StealthAddress__BadBaseAddress();
    error StealthAddress__BadPublicKey();

    function registerMetaAddress(MetaAddress calldata metaAddress) public {
        metaAddressRegistry[msg.sender] = metaAddress;
    }

    function findMetaAddress(address baseAddress) public view returns (MetaAddress memory) {
        if (metaAddressRegistry[baseAddress].publicSpendingKey == 0 && metaAddressRegistry[baseAddress].publicViewingKey == 0) {
            revert StealthAddress__BadBaseAddress();
        }
        return metaAddressRegistry[baseAddress];
    }

    //function that sets publick key addresses in array 
    function publishEphPubKey(uint256 publicKey) public {
        if (publicKey == 0) {
            revert StealthAddress__BadPublicKey();
        }
        ephPubKeyRegistry[ephCounter++] = publicKey;
    }
    
    //fucntion that prints all publick key addresses in array
    function getAllEphPubKeys() public view returns(uint256[] memory){
        uint256[] memory allEPH = new uint256[](ephCounter);
        for(uint i = 0; i < ephCounter; i++){
            allEPH[i] = ephPubKeyRegistry[i];
        }
        return allEPH;
    }
}
