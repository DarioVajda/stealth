import React from 'react'

import { ethers } from 'ethers'

import { Link } from 'react-router-dom'
import styles from './navbar.module.css'

const NavBar = ({ signature, setSignature }) => {

  const getSignature = async () => {
    let provider =  new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner();
    let sign = await signer.signMessage("Initializing Stealth Address parameters");
    console.log({sign})
    setSignature(sign);
  }

  return (
    <div className={styles.navBar}>
      <p>Ninjas 🥷🏻</p>
      <Link to="/">Generate</Link>
      <Link to="/send">Send</Link>
      <Link to="/scan">Scan</Link>
      <div className={styles.paddingDiv}/>
      <div className={styles.login} onClick={getSignature}>Log In</div>
    </div>
  )
}

export default NavBar