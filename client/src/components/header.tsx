import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header>
            <div className='div_logo_header'>
                <img src="/logo_greenroots.webp" alt="Logo GreenRoots" className='logo_greenroots'/>
                <p className="name_enterprise">GreenRoots</p>
            </div>

            <button
                className={`hamburger${menuOpen ? ' open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <nav className={menuOpen ? 'open' : ''}>
                <Link to="/" onClick={closeMenu}>Accueil</Link>
                <Link to="/catalog" onClick={closeMenu}>Catalogue</Link>
                <Link to="/about" onClick={closeMenu}>A propos</Link>
                <Link to="/contact" onClick={closeMenu}>Contact</Link>
                <div className='div_buttons_header_mobile'>
                    <Link to="/register" onClick={closeMenu}>
                        <button className="register">Inscription</button>
                    </Link>
                    <Link to="/login" onClick={closeMenu}>
                        <button className="login">Connexion</button>
                    </Link>
                </div>
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