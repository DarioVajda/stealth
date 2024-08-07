import React from 'react'

import NavBar from './NavBar'
import { generateMetaStealthAddr, generateMetaAddressKeys } from '../logic/logic'

import styles from './home.module.css'

const Home = ({ signature, setSignature }) => {

  const generate = async () => {
    console.log("performGenerating");
    let { v, k } = generateMetaAddressKeys(signature);
    console.log({v, k});
    generateMetaStealthAddr(k, v);
  }

  return (
    <div>
      <NavBar signature={signature} setSignature={setSignature} />
      <div className={styles.home}>
        <h2>Home</h2>
        <p>Generate your meta-stealth address and publish it on the blockchain</p>
        <div className={styles.generateButton} onClick={() => generateMetaStealthAddr()}>Generate</div>
      </div>
    </div>
  )
}

export default Home