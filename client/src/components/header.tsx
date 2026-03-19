import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { isLoggedIn, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    const closeMenu = () => setMenuOpen(false);

    async function handleLogout() {
        await logout();
        closeMenu();
        navigate('/');
    }

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
                    {isLoggedIn ? (
                        <>
                            <Link to="/cart" onClick={closeMenu} className="cart_icon_link">
                                <ShoppingCart size={22} />
                                {totalItems > 0 && <span className="cart_badge">{totalItems}</span>}
                            </Link>
                            <button className="login" onClick={handleLogout}>Déconnexion</button>
                        </>
                    ) : (
                        <>
                            <Link to="/register" onClick={closeMenu}>
                                <button className="register">Inscription</button>
                            </Link>
                            <Link to="/login" onClick={closeMenu}>
                                <button className="login">Connexion</button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Version desktop */}
            <div className='div_buttons_header'>
                {isLoggedIn ? (
                    <>
                        {/* Panier visible uniquement si connecté */}
                        <Link to="/cart" className="cart_icon_link">
                            <ShoppingCart size={22} />
                            {totalItems > 0 && <span className="cart_badge">{totalItems}</span>}
                        </Link>
                        <button className="login" onClick={handleLogout}>Déconnexion</button>
                    </>
                ) : (
                    <>
                        <Link to="/register">
                            <button className="register">Inscription</button>
                        </Link>
                        <Link to="/login">
                            <button className="login">Connexion</button>
                        </Link>
                    </>
                )}
            </div>
        </header>
    )
}

export default Header
