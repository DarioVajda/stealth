// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    error StealthAddress__InsufficientAllowence();
    error StealthAddress__FailedRecievingToken();

    function registerMetaAddress(MetaAddress calldata metaAddress) public {
        metaAddressRegistry[msg.sender] = metaAddress;
        
        // for testing
        console.log(
            "Recieved meta address with following keys:\n%d\n%d\n", 
            metaAddress.publicSpendingKey, 
            metaAddress.publicViewingKey
        );
        metaAddressRegistry[msg.sender] = metaAddress;
    }

    function findMetaAddress(address baseAddress) public view returns (MetaAddress memory) {
        if (metaAddressRegistry[baseAddress].publicSpendingKey == 0 && metaAddressRegistry[baseAddress].publicViewingKey == 0) {
            revert StealthAddress__BadBaseAddress();
        }

        // for testing
        console.log("Meta-address for the given address is:\n%d\n%d\n",
            metaAddressRegistry[baseAddress].publicSpendingKey, 
            metaAddressRegistry[baseAddress].publicViewingKey
        );
        return metaAddressRegistry[baseAddress];
    }

    //function that sets publick key addresses in array (the function is internal because it will be used by sendEthToStealthAddr and sendTokenToStealthAddr)
    function publishEphPubKey(uint256 publicKey) internal {
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

    // function that sends ETH to given stealth address
    function sendEthToStealthAddr(uint ephPubKey, address payable stealthAddr) public payable {
        stealthAddr.call{value: msg.value}("");

        publishEphPubKey(ephPubKey);
        console.log("Sent %d wei to stealth address %s", msg.value, stealthAddr);
    }

    // function that sends ERC20 tokens to given stealth address
    function sendTokenToStealthAddr(uint ephPubKey, address stealthAddr, address token, uint amount) public {

        IERC20 paymentToken = IERC20(token);
        if(paymentToken.allowance(msg.sender, address(this)) < amount) {
            revert StealthAddress__InsufficientAllowence();
        }
        if(!paymentToken.transferFrom(msg.sender, address(this), amount)) {
            revert StealthAddress__FailedRecievingToken();
        }

        paymentToken.transfer(stealthAddr, amount);
        
        publishEphPubKey(ephPubKey);
        console.log("Sent %d tokens to stealth address %s", amount, stealthAddr);
    }
}
