import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log({ email, password });
    }

    return (
        <main className="login_wrapper">
            <div className="login_card">
                <h1>Connexion</h1>
                <p className="login_description">Accédez à votre espace personnel GreenRoots.</p>

                <form className="login_form" onSubmit={handleSubmit}>
                    <div className="login_field">
                        <label className="login_label">Email</label>
                        <input
                            type="email"
                            className="login_input"
                            placeholder="votre@email.fr"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="login_field">
                        <label className="login_label">Mot de passe</label>
                        <input
                            type="password"
                            className="login_input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="login_btn">Se connecter</button>
                </form>

                <p className="login_redirect">
                    Pas encore de compte ? <Link to="/register">Créer un compte</Link>
                </p>
            </div>
        </main>
    )
}

export default Login