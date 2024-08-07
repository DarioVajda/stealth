import * as secp from '@noble/secp256k1';
import { ethers } from 'ethers';

function uint8ArrayToHex(uint8Array) {
    return Array.from(uint8Array)
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


    // #region temporary
    console.log({ K: uint8ArrayToHex(K), V: uint8ArrayToHex(V) });
    return { K, V };
    // #endregion


    // implement calling the contract to publish the meta-stealth address
    let provider = new ethers.BrowserProvider(window.ethereum);
    let stealthContract = new ethers.Contract(
        '0x...', // address of the contract to be added later
        'smartContract.Abi', // the ABI of the smart contract
        provider.getSigner(0)
    );

    const tx = await stealthContract.stealthSetup(K, V); // calling the function of the contract
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
    if(token == 0) {
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