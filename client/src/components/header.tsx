import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    return (
        <header>
            <div className='div_logo_header'>
            <img src="/logo_greenroots.webp" alt="Logo GreenRoots" className='logo_greenroots'/>
            <p className="name_enterprise">GreenRoots</p>
            </div>
            <nav>
                <Link to="/">Accueil</Link>
                <Link to="/catalog">Catalogue</Link>
                <Link to="/about">A propos</Link>
                <Link to="/contact">Contact</Link>
            </nav>
            <div className='div_buttons_header'>
            <Link to="/register">
                <button className="register">Inscription</button>
            </Link>
            <Link to="/login">
                <button className="login">Connexion</button>
            </Link>
            </div>
        </header>
    )
}

export default Header