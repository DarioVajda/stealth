import React, {useState} from 'react'

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

  const performSend = () => {
    console.log("performSend")

    let { V, K } = fetchPublicKeys(to);
    sendStealth(v, k, amount, token)
  }

  return (
    <div>
      <NavBar signature={signature} setSignature={setSignature} />
      <div className={styles.send}>
        <h2>Send</h2>
        {/* <h3>Here is the signature: {signature}</h3> */}
        <p>Here you can send ether or some other ERC20/ERC721 tokens to someone using a stealth address</p>
        <span>Address: </span><input type="text" name="" onChange={handleToChange} /><br />
        <span>Amount:</span><input type="number" name="" id="" onChange={handleAmountChange} /><br />
        <span>Token Address:</span><input type="text" name="" id="" onChange={handleTokenChange}/><br />
        <div className={styles.sendButton} onClick={performSend}>Send</div>
      </div>
    </div>
  )
}

export default Send