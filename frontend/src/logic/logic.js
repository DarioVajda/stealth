import * as secp from '@noble/secp256k1';
import { ethers } from 'ethers';

import contractJson from './StealthAddress.json';
const contractAbi = contractJson.abi;

function uint8ArrayToHex(uint8Array) {
    return '0x' + Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

async function generateMetaStealthAddr() {
    // generating private and public spending keys
    let k = secp.utils.randomPrivateKey(); // this should be changed later (to use signatures)
    let K = secp.getPublicKey(k);

    // generating private and public viewing keys
    let v = secp.utils.randomPrivateKey(); // this should be changed later (to use signatures)
    let V = secp.getPublicKey(v);


    console.log({K, V});
    console.log({ K: uint8ArrayToHex(K), V: uint8ArrayToHex(V) });
    // return { K, V };


    // implement calling the contract to publish the meta-stealth address
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner(0);

    let stealthContract = new ethers.Contract(
        '0xAea2d2644f2dB6542CEF21bb3B502d0326282A93', // address of the contract to be added later
        contractAbi, // the ABI of the smart contract
        signer
    );

    // TODO promeniti argumente u smart contractu da ne bude struktura nego posebno brojevi, a onda tamo da se napravi struktura
    const tx = await stealthContract.registerMetaAddress({
        // publicSpendingKey: uint8ArrayToHex(K),
        // publicViewingKey: uint8ArrayToHex(V)
        publicSpendingKey: '0x034c863d4641925a7e56192cc9cca73df9225fe07efd2f038e3a76e4fe818e9369',
        publicViewingKey: "0x023e16f66bd047e0ba4b090d3782b3051ba0eb0cd77a03ba4ca88573b001d3718b"
    }); // calling the function of the contract

    console.log("Transaction hash: ", tx.hash);
    const receipt = await tx.wait(); // waiting for the transaction to be performed
    console.log("Receipt: ", receipt);
}

async function sendStealth(V, K, value, tokenAddr) {
    // generating the ephemeral key
    let r = secp.utils.randomPrivateKey(); // this might be changed later (maybe not)
    let R = secp.getPublicKey(r);

    // generating the shared secret
    let S = secp.getSharedSecret(r, V);

    // generating the stealth address
    let hashS = ethers.sha256(S).substring(2);
    let G_hashS_Hex = secp.getPublicKey(hashS);
    let G_hashS = secp.ProjectivePoint.fromHex(G_hashS_Hex);
    let K_point = secp.ProjectivePoint.fromHex(K);
    let P_point = G_hashS.add(K_point);
    let P_hex = P_point.toHex();
    // console.log({ P_hex });

    let stealthAddr = '0x' + P_hex.slice(0, 40);
    console.log({ stealthAddr: stealthAddr });

    return;


    

    let provider = new ethers.BrowserProvider(window.ethereum);
    let stealthContract = new ethers.Contract(
        '0x...', // address of the contract to be added later
        'smartContract.Abi', // the ABI of the smart contract
        provider.getSigner(0)
    );

    let tx;
    if(tokenAddr === 0) {
        tx = await stealthContract.sendEthToStealthAddr(R, stealthAddr, { value: value }); // calling the function of the contract
    }
    else {
        tx = await stealthContract.sendTokenToStealthAddr(R, stealthAddr, value, tokenAddr); // calling the function of the
    }
    console.log("Transaction hash: ", tx.hash);
    const receipt = await tx.wait(); // waiting for the transaction to be performed
    console.log("Receipt: ", receipt);
}


// secp.getSharedSecret(r, alicesPubkey);


export { generateMetaStealthAddr, sendStealth };