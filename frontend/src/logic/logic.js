import * as secp from '@noble/secp256k1';
import { ethers } from 'ethers';

import contractJson from './StealthAddress.json';
const contractAbi = contractJson.abi;

/**
 * Convert an array of 32 uint8 numbers into one hex number represented as a string.
 * 
 * @param {int[]} uint8Array        array of 32 integers
 * @returns                         hexadecimal number represented as a string (format: '0x...')
 */
function uint8ArrayToHex(uint8Array) {
    return '0x' + Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Generate private sepnding and viewing keys (k, v) needed for meta address generation.
 * Keys are generated based on digital signature of some message.
 * 
 * @param {string} signature        digital signature of message given to user (used as seed for key generation)
 * @returns {{string, string}}      private spending and viewing keys
 */
function generateMetaAddressKeys(signature) {
    const N = secp.etc.bytesToNumberBE(secp.etc.hexToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'));

    // removing the 0x from the beginning
    console.log({signature});
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
 * Generate meta address based on private spending and viewing keys. Meta address is of the form
 * (K, V), where K and V are public spending and viewing keys respectively.
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
 * Send ETH or ERC20 tokens to stealth address that is generated using public spending and viewing keys.
 * 
 * @param {String} V public viewing key
 * @param {String} K public spending key
 * @param {Int} value value of the token to be sent
 * @param {Address} tokenAddr 0 for ether and the address of the token for ERC20 tokens otherwise
 */
async function sendStealth(V, K, value, tokenAddr, signature) {
    const N = secp.etc.bytesToNumberBE(secp.etc.hexToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'));


    V = V.substring(2);
    K = K.substring(2);
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
    let P_hex = P_point.toHex(false);
    let stealthAddr = '0x' + ethers.keccak256('0x' + P_hex.slice(2)).slice(-40);
    console.log({ stealthAddr });



    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner(0);

    let stealthContract = new ethers.Contract(
        '0x2ca6D993651d967a00d494D8d059b14AFD895Aa2', // address of the contract
        contractAbi,                                  // the ABI of the smart contract
        signer 
    );

    let tx;
    if(tokenAddr == 0) {
        tx = await stealthContract.sendEthToStealthAddr(R, stealthAddr, { value: value }); // calling the function of the contract
    }
    else {
        tx = await stealthContract.sendTokenToStealthAddr(R, stealthAddr, value, tokenAddr); // calling the function of the
    }
    console.log("Transaction hash: ", tx.hash);
    const receipt = await tx.wait(); // waiting for the transaction to be performed
    console.log("Receipt: ", receipt);
}

/**
 * Fetch public spending and viewing keys (which together form meta address) associated with Ethereum account
 * whose address is given as a parameter.
 * 
 * @param {Address} address         address of an Ethereum account
 * @returns {{String, String}}      public keys (meta address) associated with the account in the hex form ('0x...')
 */
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

    return {
        K: metaAddress[0],
        V: metaAddress[1]
    };
}
/**
 * Calculate private key and the stealth address using the given ephemeral pubkey.
 * 
 * @param {String} R        ephemeral pubkey
 * @param {String} v        private viewing key
 * @param {String} k        private spending key
 * @returns                 stealth address and private key associated with it
 */
function calculatePrivateKey(R, v, k) {
    const N = secp.etc.bytesToNumberBE(secp.etc.hexToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'));

    R = R.substring(2);
    v = v.substring(2);
    k = k.substring(2);
    // console.log({ R, v, k });
    
    let S = secp.getSharedSecret(v, R);
    let hashS = ethers.sha256(S).substring(2);
    // console.log({ hashS });
    // console.log({ hashSPutaG: secp.getPublicKey(hashS) });
    let s_num = secp.etc.bytesToNumberBE(hashS);
    let k_num = secp.etc.bytesToNumberBE(secp.etc.hexToBytes(k));

    s_num = secp.etc.mod(s_num, N);
    let p = secp.etc.mod(s_num + k_num, N);
    p = secp.etc.bytesToHex(secp.etc.numberToBytesBE(p));

    // let P = secp.getPublicKey(p);
    // console.log({ P: uint8ArrayToHex(P) })

    let stealthWallet = new ethers.Wallet(p);
    let stealthAddr = stealthWallet.address;
    console.log({ stealthAddr });

    return { addr: stealthAddr, privKey: p };
}

/**
*   Fetch all ephemeral pubkeys from the registry stored on the smart contract
*
*   @returns {String[]}         List of published ephemeral pubkeys on the contract
*/
async function fetchEphermalKeys() {
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner(0);

    let stealthContract = new ethers.Contract(
        '0x2ca6D993651d967a00d494D8d059b14AFD895Aa2', // address of the contract to be added later
        contractAbi, // the ABI of the smart contract
        signer
    );

    let ephPubKeys = await stealthContract.getAllEphPubKeys();
    // console.log(ephPubKeys);
    ephPubKeys = JSON.parse(JSON.stringify(ephPubKeys))
    // console.log(ephPubKeys);
    return ephPubKeys;
}


// secp.getSharedSecret(r, alicesPubkey);


export { generateMetaStealthAddr, sendStealth, calculatePrivateKey, generateMetaAddressKeys, fetchPublicKeys, fetchEphermalKeys };