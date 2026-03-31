import { useState, useActionState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import '../components/styles/Register.css';

function Register() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
    const navigate = useNavigate();
    const [, action, isPending] = useActionState(registerAction, '');

    async function registerAction(_prev: string, formData: FormData) {
        const firstname = formData.get('firstname') as string;
        const lastname = formData.get('lastname') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas.';
        if (!hasAcceptedPolicies) return 'Vous devez accepter les conditions et la politique de confidentialité pour créer un compte.';

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': localStorage.getItem('csrfToken') || ''
                },
                body: JSON.stringify({ firstname, lastname, email, password }),
            });

            if (!res.ok) {
                toast.error('Erreur lors de l\'inscription', { id: 'register-error' });
                return'';
            }

            toast.success("Compte créé avec succès", { id: 'register-success' });
            navigate('/login');
            return '';

        } catch {
            toast.error('Une erreur est survenue', { id: 'register-error' }) // toast.error retourne un id de toast(number)
            return '';
        }
    }

    return (
        <main className="register_wrapper">
            <div className="register_card">
                <h1>Créer un compte</h1>
                <p className="register_description">Rejoignez GreenRoots et contribuez à la reforestation.</p>

                <form className="register_form" action={action} aria-label="Formulaire d'inscription">
                    <div className="register_form_row">
                        <div className="register_field">
                            <label className="register_label" htmlFor="register-firstname">Prénom</label>
                            <input
                                id="register-firstname"
                                name="firstname"
                                type="text"
                                className="register_input"
                                placeholder="Votre prénom"
                                autoComplete="given-name"
                            />
                        </div>
                        <div className="register_field">
                            <label className="register_label" htmlFor="register-lastname">Nom</label>
                            <input
                                id="register-lastname"
                                name="lastname"
                                type="text"
                                className="register_input"
                                placeholder="Votre nom"
                                autoComplete="family-name"
                            />
                        </div>
                    </div>
                    <div className="register_field">
                        <label className="register_label" htmlFor="register-email">Email</label>
                        <input
                            id="register-email"
                            name="email"
                            type="email"
                            className="register_input"
                            placeholder="votre@email.fr"
                            autoComplete="email"
                        />
                    </div>
                    <div className="register_field">
                        <label className="register_label" htmlFor="register-password">Mot de passe</label>
                        <input
                            id="register-password"
                            name="password"
                            type="password"
                            className="register_input"
                            placeholder="********"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="register_field">
                        <label className="register_label" htmlFor="register-confirmPassword">Confirmer le mot de passe</label>
                        <input
                            id="register-confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className={`register_input ${confirmPassword && password !== confirmPassword ? 'register_input_error' : ''}`}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="register_error">Les mots de passe ne correspondent pas.</p>
                        )}
                    </div>

                    <label className="register_consent">
                        <input
                            type="checkbox"
                            className="register_checkbox"
                            checked={hasAcceptedPolicies}
                            onChange={e => setHasAcceptedPolicies(e.target.checked)}
                        />
                        <span className="register_consent_text">
                            J'accepte les <Link to="/cgv">CGV</Link>, la{' '}
                            <Link to="/privacy-policy">politique de confidentialité</Link> et la{' '}
                            <Link to="/cookies">politique de cookies</Link>.
                        </span>
                    </label>

                    <button type="submit" className="register_btn" disabled={isPending}>
                        {isPending ? 'Inscription...' : 'Créer mon compte'}
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