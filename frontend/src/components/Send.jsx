import React, {useState} from 'react'

import { Link } from 'react-router-dom'
import NavBar from './NavBar'
import { sendStealth } from '../logic/logic'

import styles from './send.module.css'

const Send = ({ signature, setSignature }) => {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState(0);
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

  const tempV = '03ba1a3a24930c60bdaf49ab8afb279831eb8d930bc373a2ec959ba3df2916a530'
  const tempK = '0228f511f6efccf427bf8d9a2f4fef23fd0cb94a502bd427c7bf94e7ee31d6cd82'

  const performSend = () => {
    sendStealth(tempV, tempK)
  }

  return (
    <div>
      <NavBar signature={signature} setSignature={setSignature} />
      <div className={styles.send}>
        <h2>Send</h2>
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