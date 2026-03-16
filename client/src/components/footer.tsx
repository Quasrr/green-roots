import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer>
            <img src="/logo.webp" alt="Logo GreenRoots" />
            <p className="name_enterprise">GreenRoots</p>
            <p className="description_footer">Redonnez vie à votre jardin avec nos arbres d'exception, sélectionnés avec soin auprès des meilleures pépinières mondiales</p>
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