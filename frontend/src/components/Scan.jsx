import React from 'react'
import BigNumber from 'bignumber.js';

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
    if(!signature) return;


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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Hex copied to clipboard!');
        alert('Hex copied to clipboard!');
      })
      .catch(err => {
        console.error('Error copying to clipboard: ', err);
      });
  };

  const weiToEth = (weiString) => {
    const wei = new BigNumber(weiString);
    const eth = wei.dividedBy(new BigNumber('1e18'));
    return eth.toFixed(); // Convert to string with precision
  };

  console.log(wallets);

  return (
    <div>
      <NavBar signature={signature} setSignature={setSignature} />
      <div className={styles.scan}>
        <div className={styles.scanBtn} onClick={pullWalletBalances}>Scan</div>
        {
          !signature &&
          <p>
            Log in to generate your meta-stealth address
          </p>
        }
        <div className={styles.wallets}>{
          wallets.filter(value => value.balance).map((wallet, index) => (
              <div key={index} className={styles.wallet}>
                <div>
                  <p>Wallet #{index + 1}</p>
                  <span>Address:</span>
                  <p onClick={() => handleCopy(wallet.address)}>{wallet.address}</p>
                  <span>Private key:</span>
                  <p onClick={() => handleCopy(wallet.privKey)}>{wallet.privKey.substring(0, 10)}...</p>
                  <span>Balance:</span>
                  <p>{weiToEth(`${wallet.balance}`)} ETH</p>
                </div>
              </div>
          ))
        }</div>
      </div>
    </div>
  )
}

export default Scan