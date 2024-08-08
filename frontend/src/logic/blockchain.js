import { ethers } from 'ethers';

import contractJson from './StealthAddress.json';
const contractAbi = contractJson.abi;

async function checkBalance(address) {
    // console.log("Checking balance for: ", address);
    let provider = new ethers.BrowserProvider(window.ethereum);
    // let signer = await provider.getSigner(0);

    let balance = await provider.getBalance(address);
    return balance;
}

export { checkBalance }