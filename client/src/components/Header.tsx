import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import '../components/styles/Header.css';

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);       // burger (nav links)
    const [userMenuOpen, setUserMenuOpen] = useState(false); // dropdown profil

    const { user, isLoggedIn, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Ferme le dropdown si on clique en dehors
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function closeAll() {
        setMenuOpen(false);
        setUserMenuOpen(false);
    }

    async function handleLogout() {
        await logout();
        closeAll();
        navigate('/');
    }

    return (
        <header>
            <div className='div_logo_header'>
                <Link to="/" className="div_logo_header">
                    <img src="/logo_greenroots.webp" alt="Logo GreenRoots" className='logo_greenroots' />
                    <p className="name_enterprise">GreenRoots</p>
                </Link>
            </div>

            <div className="header_actions">

                {/* Icônes panier + utilisateur — visibles quand connecté */}
                {isLoggedIn && (
                    <>
                        <Link to="/cart" className="cart_icon_link" onClick={closeAll}>
                            <ShoppingCart size={22} />
                            {totalItems > 0 && <span className="cart_badge">{totalItems}</span>}
                        </Link>

                        <div className="user_menu" ref={userMenuRef}>
                            <button
                                className="user_icon_btn"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                aria-label="Mon compte"
                            >
                                <UserCircle size={26} />
                            </button>

                            {userMenuOpen && (
                                <div className="user_dropdown">
                                    {user?.role === 1 && (
                                        <Link to="/admin" className="user_dropdown_item" onClick={closeAll}>
                                            Dashboard
                                        </Link>
                                    )}
                                    <Link to="/account" className="user_dropdown_item" onClick={closeAll}>
                                        Mon compte
                                    </Link>
                                    <Link to="/account/orders" className="user_dropdown_item" onClick={closeAll}>
                                        Mes commandes
                                    </Link>
                                    <button className="user_dropdown_item user_dropdown_logout" onClick={handleLogout}>
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Inscription / Connexion — visibles sur DESKTOP uniquement */}
                {!isLoggedIn && (
                    <div className="auth_desktop">
                        <Link to="/register">
                            <button className="register">Inscription</button>
                        </Link>
                        <Link to="/login">
                            <button className="login">Connexion</button>
                        </Link>
                    </div>
                )}

                {/* Burger — mobile uniquement */}
                <button
                    className={`hamburger${menuOpen ? ' open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* Nav — toujours APRÈS header_actions pour que flex-wrap la place en dessous */}
            <nav className={menuOpen ? 'open' : ''}>
                <Link to="/" onClick={closeAll}>Accueil</Link>
                <Link to="/catalog" onClick={closeAll}>Catalogue</Link>
                <Link to="/about" onClick={closeAll}>À propos</Link>
                <Link to="/contact" onClick={closeAll}>Contact</Link>

                {/* Non connecté : inscription + connexion dans le burger (mobile uniquement) */}
                {!isLoggedIn && (
                    <div className="nav_auth_mobile">
                        <Link to="/register" onClick={closeAll}>
                            <button className="register">Inscription</button>
                        </Link>
                        <Link to="/login" onClick={closeAll}>
                            <button className="login">Connexion</button>
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;
