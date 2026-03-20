import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/styles/Register.css';

function Register() {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstname, lastname, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Erreur lors de l\'inscription');
            }

            navigate('/login');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="register_wrapper">
            <div className="register_card">
                <h1>Créer un compte</h1>
                <p className="register_description">Rejoignez GreenRoots et contribuez à la reforestation.</p>

                <form className="register_form" onSubmit={handleSubmit}>
                    <div className="register_form_row">
                        <div className="register_field">
                            <label className="register_label">Prénom</label>
                            <input
                                type="text"
                                className="register_input"
                                placeholder="Votre prénom"
                                value={firstname}
                                onChange={e => setFirstname(e.target.value)}
                            />
                        </div>
                        <div className="register_field">
                            <label className="register_label">Nom</label>
                            <input
                                type="text"
                                className="register_input"
                                placeholder="Votre nom"
                                value={lastname}
                                onChange={e => setLastname(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="register_field">
                        <label className="register_label">Email</label>
                        <input
                            type="email"
                            className="register_input"
                            placeholder="votre@email.fr"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="register_field">
                        <label className="register_label">Mot de passe</label>
                        <input
                            type="password"
                            className="register_input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="register_field">
                        <label className="register_label">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            className={`register_input ${confirmPassword && password !== confirmPassword ? 'register_input_error' : ''}`}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="register_error">Les mots de passe ne correspondent pas.</p>
                        )}
                    </div>

                    {error && <p className="register_error_global">{error}</p>}

                    <button type="submit" className="register_btn" disabled={isLoading}>
                        {isLoading ? 'Inscription...' : 'Créer mon compte'}
                    </button>
                </form>

                <p className="register_redirect">
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </main>
    );
}

export default Register;
