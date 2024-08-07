import React, {useState} from 'react'

import { Link } from 'react-router-dom'
import { sendStealth } from '../logic/logic'

const Send = () => {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState(0)

  const handleToChange = (event) => {
    setTo(event.target.value);
  };
  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  }

  const tempV = '03ba1a3a24930c60bdaf49ab8afb279831eb8d930bc373a2ec959ba3df2916a530'
  const tempK = '0228f511f6efccf427bf8d9a2f4fef23fd0cb94a502bd427c7bf94e7ee31d6cd82'

  return (
    <div>
      <div>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/scan">Scan</Link></li>
      </div>
      <div>
        <h2>Send</h2>
        <p>Here you can send ether or some other ERC20/ERC721 tokens to someone using a stealth address</p>
        <input type="text" name="Address" onChange={handleToChange} />
        <input type="number" name="" id="" onChange={handleAmountChange} />
        <input type="button" value="Send" onClick={() => sendStealth(tempV, tempK)} />
      </div>
    </div>
  )
}

export default Send