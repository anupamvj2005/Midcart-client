import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>💊 <strong>SmartPharma</strong></div>
          <p>India's most affordable online pharmacy. Save up to 60% on genuine medicines.</p>
          <div className={styles.badges}>
            <span>✔ Certified Pharmacy</span>
            <span>✔ Genuine Medicines</span>
            <span>✔ Fast Delivery</span>
          </div>
        </div>

        <div className={styles.links}>
          <h4>Quick Links</h4>
          <Link to="/products">All Medicines</Link>
          <Link to="/products?category=fever-cold">Fever & Cold</Link>
          <Link to="/products?category=diabetes">Diabetes</Link>
          <Link to="/products?category=vitamins">Vitamins</Link>
          <Link to="/prescriptions/upload">Upload Prescription</Link>
        </div>

        <div className={styles.links}>
          <h4>Account</h4>
          <Link to="/dashboard">My Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/prescriptions">Prescriptions</Link>
          <Link to="/cart">My Cart</Link>
        </div>

        <div className={styles.contact}>
          <h4>Contact Us</h4>
          <p>📞 1800-XXX-XXXX (Free)</p>
          <p>📧 support@smartpharma.com</p>
          <p>🕐 Mon–Sat: 9 AM – 9 PM</p>
          <div className={styles.social}>
            <a href="#" aria-label="Instagram">📸</a>
            <a href="#" aria-label="Facebook">👍</a>
            <a href="#" aria-label="Twitter">🐦</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} SmartPharma. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
