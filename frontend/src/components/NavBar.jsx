import React from 'react'

import { Link } from 'react-router-dom'
import styles from './navbar.module.css'

const NavBar = ({ signature, setSignature }) => {
  return (
    <div className={styles.navBar}>
      <p>Ninjas 🥷🏻</p>
      <Link to="/">Sign Up</Link>
      <Link to="/send">Send</Link>
      <Link to="/scan">Scan</Link>
      <div className={styles.paddingDiv}/>
      <div className={styles.login}>Log In</div>
    </div>
  )
}

export default NavBar