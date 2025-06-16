import styles from './Navbar.module.scss'

function Navbar() {
  return (
    <div>
        <div className={styles.nav}>  
            <ul className={styles.inner__nav}>
                <li>Index</li>
                <li>Artists</li>
                <li>[GALLERY]</li>
                <li>About</li>
            </ul>
            <div>
                <h1>logo</h1>
            </div>
            <div>
                stuff
            </div>
        </div>
    </div>
  )
}

export default Navbar