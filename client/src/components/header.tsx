import { Link } from 'react-router-dom';

function Header() {
    return (
        <header>
            <img src="/logo.webp" alt="Logo GreenRoots" />
            <p className="name_enterprise">GreenRoots</p>
            <nav>
                <Link to="/">Accueil</Link>
                <Link to="/catalog">Catalogue</Link>
                <Link to="/about">A propos</Link>
                <Link to="/contact">Contact</Link>
            </nav>
            <Link to="/register">
                <button className="register">Inscription</button>
            </Link>
            <Link to="/login">
                <button className="login">Connexion</button>
            </Link>
        </header>
    )
}

export default Header