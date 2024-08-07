import React from 'react'

import { Link } from 'react-router-dom'
import { generateMetaStealthAddr } from '../logic/logic'

const Home = () => {
  return (
    <div>
      <div>
        <li><Link to="/send">Send</Link></li>
        <li><Link to="/scan">Scan</Link></li>
      </div>
      <div>
        <h2>Home</h2>
        <p>Generate your meta-stealth address and publish it on the blockchain</p>
        <input type="button" value="Generate" onClick={() => generateMetaStealthAddr()} />
      </div>
    </div>
  )
}

export default Home