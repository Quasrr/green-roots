import { Link } from 'react-router-dom';
import '../components/styles/Footer.css';

function Footer() {
    return (
        <footer>
            <div className="footer_copyright_out">
                <div className="wrap_logo_description">
                    <Link to="/" className="div_logo_description">
                        <div className="div_logo_description">
                            <img src="/logo_greenroots.webp" alt="Logo GreenRoots" className='logo_greenroots' />
                            <p className="name_enterprise_footer">GreenRoots</p>
                        </div>
                    </Link>
                    <p className="description_footer">Redonnez vie à votre jardin avec nos arbres d'exception, sélectionnés avec soin auprès des meilleures pépinières mondiales</p>
                </div>
                <nav className='nav_footer'>
                    <p className="nav_categorie">Information</p>
                    <Link to="/cgv">CGV</Link>
                    <Link to="/legals">Mentions légales</Link>
                </nav>
                <nav className='nav_footer'>
                    <p className="nav_categorie">Social</p>
                    <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
                    <a href="https://x.com/" target="_blank" rel="noreferrer">X</a>
                    <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a>
                </nav>
                <nav className='nav_footer'>
                    <p className="nav_categorie">Entreprise</p>
                    <Link to="/about">A propos</Link>
                    <Link to="/contact">Contact</Link>
                </nav>
            </div>
            <div className="copyright">
                <p className="copyright_text">© 2026 GreenRoots. Tous droits réservés.</p>
                <div className="nav_footer_copyright">
                    <Link to="/privacy-policy">Politique de confidentialité</Link>
                    <Link to="/cookies">Cookies</Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer