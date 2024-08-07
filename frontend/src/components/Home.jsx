import React from 'react'

import NavBar from './NavBar'
import { generateMetaStealthAddr } from '../logic/logic'

import styles from './home.module.css'

const Home = ({ signature, setSignature }) => {
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