import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password); // appel à l'API via le context
            navigate('/');               // redirige vers l'accueil si succès
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
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
                    {error && <p className="login_error">{error}</p>}
                    <button type="submit" className="login_btn" disabled={isLoading}>
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p className="login_redirect">
                    Pas encore de compte ? <Link to="/register">Créer un compte</Link>
                </p>
            </div>
        </main>
    )
}

export default Login