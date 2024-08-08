import React, {useState} from 'react'
import BigNumber from 'bignumber.js';

import { Link } from 'react-router-dom'
import NavBar from './NavBar'
import { sendStealth, fetchPublicKeys } from '../logic/logic'

import styles from './send.module.css'

const Send = ({ signature, setSignature }) => {
  const [to, setTo] = useState('');
  const [ amount, setAmount ] = useState(0);
  const [ token, setToken ] = useState('');

  const handleToChange = (event) => {
    setTo(event.target.value);
  };
  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  }
  const handleTokenChange = (event) => {
    setToken(event.target.value);
  }

  const ethToWei = (ethString) => {
    const eth = new BigNumber(ethString);
    const wei = eth.multipliedBy(new BigNumber('1e18'));
    return wei.toFixed(); // Convert to string without losing precision
  };

  const performSend = async () => {
    console.log("performSend")

    let amountEth = ethToWei(amount);
    console.log(amountEth, amount);


    let { V, K } = await fetchPublicKeys(to);
    sendStealth(V, K, amountEth, 0, signature)
  }

  return (
    <div>
      <NavBar signature={signature} setSignature={setSignature} />
      <div className={styles.send}>
        <h2>Send ETH</h2>
        {/* <h3>Here is the signature: {signature}</h3> */}
        <p>Here you can send ETH to someone using a stealth address</p>
        <span>Address: </span>
        <input type="text" className={styles.addrInput} onChange={handleToChange} /><br />
        <span>Amount:</span>
        <input type="text" className={styles.valueInput} onChange={handleAmountChange} /><br />
        {/* <span>Token Address:</span><input type="text" name="" id="" onChange={handleTokenChange}/><br /> */}
        <div className={styles.sendButton} onClick={performSend}>Send</div>
      </div>
    </div>
  )
}

export default Send