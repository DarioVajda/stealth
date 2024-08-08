// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StealthAddress {

    struct MetaAddress {
        bytes publicSpendingKey;       // K
        bytes publicViewingKey;        // V
    }

    uint ephCounter;

    mapping(address => uint) lastIndexes;
    mapping(uint256 => bytes) ephPubKeyRegistry;
    mapping(address => MetaAddress) metaAddressRegistry;
    
    error StealthAddress__BadBaseAddress();
    error StealthAddress__BadPublicKey();
    error StealthAddress__InsufficientAllowence();
    error StealthAddress__FailedRecievingToken();
    error StealthAddress__FailedSendingEth();

    event StealthAddress__PublishedEphPubKey(uint256 indexed count);

    // function for registering a meta address in meta address registry
    function registerMetaAddress(MetaAddress calldata metaAddress) public {
        metaAddressRegistry[msg.sender] = metaAddress;
        
        // for testing
        // console.log(
        //    "Recieved meta address with following keys:\n%d\n%d\n", 
        //    metaAddress.publicSpendingKey, 
        //    metaAddress.publicViewingKey
        // );
        metaAddressRegistry[msg.sender] = metaAddress;
    }

    function areAllBytesZero(bytes memory data) internal pure returns(bool){
        for (uint256 i =0 ; i < data.length; i++) {
            if (data[i] != 0) {
                return false;
            }
        }
        return true;
    }

    // function for finding meta address given an existing ETH address
    function findMetaAddress(address baseAddress) public view returns (MetaAddress memory) {
        if (
            areAllBytesZero(metaAddressRegistry[baseAddress].publicSpendingKey) && 
            areAllBytesZero(metaAddressRegistry[baseAddress].publicViewingKey)
        ) {
            revert StealthAddress__BadBaseAddress();
        }

        // for testing
        // console.log("Meta-address for the given address is:\n%d\n%d\n",
        //     metaAddressRegistry[baseAddress].publicSpendingKey, 
        //     metaAddressRegistry[baseAddress].publicViewingKey
        // );
        return metaAddressRegistry[baseAddress];
    }

    // function that adds ephemeral pubkey to the registry
    function publishEphPubKey(bytes calldata publicKey) internal {
        if (areAllBytesZero(publicKey)) {
            revert StealthAddress__BadPublicKey();
        }
        ephPubKeyRegistry[ephCounter++] = publicKey;
        emit StealthAddress__PublishedEphPubKey(ephCounter);
    }
    
    // fucntion that returns all ephemeral pubkeys found in the registry
    function getAllEphPubKeys() public view returns(bytes[] memory){
        bytes[] memory allEPH = new bytes[](ephCounter);
        for(uint i = 0; i < ephCounter; i++){
            allEPH[i] = ephPubKeyRegistry[i];
        }
        return allEPH;
    }

    // fucntion that returns all ephemeral pubkeys found in the registry
    function getNewPubKeys(uint startIndex) public view returns(bytes[] memory) {
        bytes[] memory newEPH = new bytes[](ephCounter - startIndex);
        for (uint i = startIndex; i < ephCounter; i++){
            newEPH[i - startIndex] = ephPubKeyRegistry[i];
        }
        return newEPH;
    }

    // function that sends ETH to given stealth address
    function sendEthToStealthAddr(bytes calldata ephPubKey, address payable stealthAddr) public payable {
        (bool success, ) = stealthAddr.call{value: msg.value}("");
        if(!success) {
            revert StealthAddress__FailedSendingEth();
        }

        publishEphPubKey(ephPubKey);
        console.log("Sent %d wei to stealth address %s", msg.value, stealthAddr);
    }

    // function that sends ERC20 tokens to given stealth address
    function sendTokenToStealthAddr(bytes calldata ephPubKey, address stealthAddr, address token, uint amount) public {

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
