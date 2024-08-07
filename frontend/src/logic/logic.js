import * as secp from '@noble/secp256k1';
import { ethers } from 'ethers';

import contractJson from './StealthAddress.json';
const contractAbi = contractJson.abi;

function uint8ArrayToHex(uint8Array) {
    return '0x' + Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

function generateMetaAddressKeys(signature) {
    const N = secp.etc.bytesToNumberBE(secp.etc.hexToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'));

    // removing the 0x from the beginning
    signature = signature.substring(2)

    // splitting the signature into two seeds
    let seed_k = signature.substring(0, 49);
    let seed_v = signature.substring(49, 98);
    
    // hashing the seeds
    let hash_k = ethers.sha256(secp.etc.hexToBytes(seed_k + seed_v)).substring(2);
    let hash_v = ethers.sha256(secp.etc.hexToBytes(seed_v + seed_k)).substring(2);

    // convert hash_k and hash_v to bigint
    let k_num = secp.etc.bytesToNumberBE(secp.etc.hexToBytes(hash_k));
    let v_num = secp.etc.bytesToNumberBE(secp.etc.hexToBytes(hash_v));

    // calculate the private keys by taking the modulo of the sum of the two numbers with N
    let k = uint8ArrayToHex(secp.etc.numberToBytesBE(secp.etc.mod(k_num, N)));
    let v = uint8ArrayToHex(secp.etc.numberToBytesBE(secp.etc.mod(v_num, N)));

    return { k, v };
}

/**
 * 
 * @param {String} k private spending key
 * @param {String} v private viewing key
 */
async function generateMetaStealthAddr(k, v) {
    // generating private and public spending keys
    // let k = secp.utils.randomPrivateKey(); // this should be changed later (to use signatures)
    let K = secp.getPublicKey(k.substring(2));

    // generating private and public viewing keys
    // let v = secp.utils.randomPrivateKey(); // this should be changed later (to use signatures)
    let V = secp.getPublicKey(v.substring(2));


    // TODO make sure the code below works
    // implement calling the contract to publish the meta-stealth address
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner(0);

    let stealthContract = new ethers.Contract(
        '0x2ca6D993651d967a00d494D8d059b14AFD895Aa2', // address of the contract to be added later
        contractAbi, // the ABI of the smart contract
        signer
    );

    console.log("Sending to contract values", uint8ArrayToHex(K), uint8ArrayToHex(V));
    const tx = await stealthContract.registerMetaAddress({
        publicSpendingKey: uint8ArrayToHex(K),
        publicViewingKey: uint8ArrayToHex(V),
    }); // calling the function of the contract

    console.log("Transaction hash: ", tx.hash);
    const receipt = await tx.wait(); // waiting for the transaction to be performed
    console.log("Receipt: ", receipt);
}

/**
 * 
 * @param {String} v private viewing key
 * @param {String} k private spending key
 * @param {Int} value value of the token to be sent
 * @param {Address} tokenAddr 0 for ether and the address of the token for ERC20 tokens otherwise
 */
async function sendStealth(v, k, value, tokenAddr) {
    const N = secp.etc.bytesToNumberBE(secp.etc.hexToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'));


    let V = secp.getPublicKey(v);
    let K = secp.getPublicKey(k);
    // generating the ephemeral key
    let r = secp.utils.randomPrivateKey(); // this might be changed later (maybe not)
    let R = secp.getPublicKey(r);

    
    // generating the shared secret
    let S = secp.getSharedSecret(r, V);

    // generating the stealth address
    let hashS = ethers.sha256(S).substring(2);
    console.log({hashS})
    
    let hashSNum = secp.etc.mod(secp.etc.bytesToNumberBE(hashS), N)
    hashSNum = uint8ArrayToHex(secp.etc.numberToBytesBE(hashSNum)).substring(2)

    let G_hashS_Hex = secp.getPublicKey(hashSNum);
    let G_hashS = secp.ProjectivePoint.fromHex(G_hashS_Hex);
    let K_point = secp.ProjectivePoint.fromHex(K);
    let P_point = G_hashS.add(K_point);
    let P_hex = P_point.toHex();
    console.log({ P_hex });

    let stealthAddr = '0x' + P_hex.slice(0, 40);
    console.log({ stealthAddr });



    // TODO make sure the code below works
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

async function fetchPublicKeys(address) {
    // fetch the public keys from the contract

    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner(0);

    let stealthContract = new ethers.Contract(
        '0x2ca6D993651d967a00d494D8d059b14AFD895Aa2', // address of the contract to be added later
        contractAbi, // the ABI of the smart contract
        signer
    );

    let metaAddress = await stealthContract.findMetaAddress(address);
    console.log(metaAddress);

    return {
        V: '0x...',
        K: '0x...'
    };
}

async function calculatePrivateKey(R, v, k) {
    const N = secp.etc.bytesToNumberBE(secp.etc.hexToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'));
    
    let S = secp.getSharedSecret(v, R);
    let hashS = ethers.sha256(S).substring(2);
    console.log({ hashS });
    console.log({ hashSPutaG: secp.getPublicKey(hashS) });
    let s_num = secp.etc.bytesToNumberBE(hashS);
    let k_num = secp.etc.bytesToNumberBE(secp.etc.hexToBytes(k));

    s_num = secp.etc.mod(s_num, N);
    let p = secp.etc.mod(s_num + k_num, N);
    // console.log({ p });

    let P = secp.getPublicKey(p);
    console.log({ P: uint8ArrayToHex(P) })
    let stealthAddr = uint8ArrayToHex(P).slice(0, 40);
    console.log({ stealthAddr });

    return { addr: stealthAddr, privKey: uint8ArrayToHex(secp.etc.numberToBytesBE(p)) };
}


// secp.getSharedSecret(r, alicesPubkey);


export { generateMetaStealthAddr, sendStealth, calculatePrivateKey, generateMetaAddressKeys, fetchPublicKeys };