import React from 'react'

import { fetchEphermalKeys, calculatePrivateKey, generateMetaAddressKeys } from '../logic/logic'
import { checkBalance } from '../logic/blockchain';

import NavBar from './NavBar';
import styles from './scan.module.css';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Scan = ({ signature, setSignature }) => {

  const [ wallets, setWallets ] = React.useState([]);

  const pullWalletBalances = async () => {
    // loading the ephemeral keys
    let ephKeys = await fetchEphermalKeys();

    // calculating the private keys and stealth addresses
    let { v, k } = generateMetaAddressKeys(signature);
    let addresses = ephKeys.map((ephKey) => {
      let r = calculatePrivateKey(ephKey, v, k);
      return r;
    });
    // console.log("addresses: ", addresses);

    // fetching the balances of each wallet
    const newBalance = async (wallet) => {
      // console.log({wallet});
      let balance = await checkBalance(wallet.addr);
      balances.push({ 
        address: wallet.addr, 
        privKey: wallet.privKey, 
        balance 
      });
    }
    let balances = [];
    for(let i = 0; i < addresses.length; i++) {
      newBalance(addresses[i]);
    }
    while(balances.length < addresses.length) {
      // console.log("waiting for balances", balances);
      await delay(200);
    }
    
    setWallets(balances);
    console.log({balances});
    // console.log("wallets: ", wallets);
  }

  console.log(wallets);

  return (
    <div>
      <NavBar signature={signature} setSignature={setSignature} />
      <div className={styles.scan}>
        <div className={styles.scanBtn} onClick={pullWalletBalances}>Scan</div>
        <div className={styles.wallets}>{
          wallets.map((wallet, index) => (
              wallet.balance &&
              <div key={index} className={styles.wallet}>
                <p>Wallet</p>
                <p>{wallet.address}</p>
                <p>{wallet.privKey}</p>
                <p>{`${wallet.balance}`}</p>
              </div>
          ))
        }</div>
      </div>
    </div>
  )
}

export default Scan