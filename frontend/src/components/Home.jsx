import React, { useState } from 'react'
import { ethers } from 'ethers'
import { Link } from 'react-router-dom'

import NavBar from './NavBar'
import { generateMetaStealthAddr, generateMetaAddressKeys } from '../logic/logic'

import styles from './home.module.css'

const Home = ({ signature, setSignature }) => {

  const [state, setState ] = useState("not_generated")

  const getSignature = async () => {
    let provider =  new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner();
    let sign = await signer.signMessage("Initializing Stealth Address parameters");
    return sign;
  }

  const generate = async () => {
    if(state != 'not_generated') return;
    
    let sign = signature;
    if(!signature) {
      sign = await getSignature();
      setSignature(sign);
    }
    setState('generating');

    let { v, k } = generateMetaAddressKeys(sign);
    console.log({v, k});
    generateMetaStealthAddr(k, v);

    setState('generated');
  }

  return (
    <div className={styles.wrapper}>
      <NavBar signature={signature} setSignature={setSignature} />
      <div className={styles.home}>
        <h2>Generate your meta-stealth address</h2>
        <p>Having a meta-stealth address will allow others to send you money without any visible link to your main wallet</p>
        <div className={styles.generateButton} onClick={generate}>
          {state=='not_generated'? 'Generate': state=='generating'? '...': 'Done'}
        </div>
        {
          state=='generated' &&
          <p>
            Meta stealth address has been generated successfully! Anyone can now send money to a stealth address you will have access to. Check <Link to="/scan">here</Link> if you have recieved any payments.
          </p>
        }
      </div>
    </div>
  )
}

export default Home