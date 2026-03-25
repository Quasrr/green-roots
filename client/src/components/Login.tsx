import { useActionState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../components/styles/Login.css';

function Login() {
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    async function loginAction(_prev: string, formData: FormData) {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await login(email, password);
            navigate('/');
            return '';
        } catch (err) {
            return err instanceof Error ? err.message : 'Une erreur est survenue';
        }
    }

    const [error, action, isPending] = useActionState(loginAction, '');

    if (isLoggedIn) return <Navigate to="/" replace />;

    return (
        <main className="login_wrapper">
            <div className="login_card">
                <h1>Connexion</h1>
                <p className="login_description">Accédez à votre espace personnel GreenRoots.</p>

                <form className="login_form" action={action}>
                    <div className="login_field">
                        <label className="login_label">Email</label>
                        <input
                            name="email"
                            type="email"
                            className="login_input"
                            placeholder="votre@email.fr"
                        />
                    </div>
                    <div className="login_field">
                        <label className="login_label">Mot de passe</label>
                        <input
                            name="password"
                            type="password"
                            className="login_input"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="login_error">{error}</p>}

                    <button type="submit" className="login_btn" disabled={isPending}>
                        {isPending ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p className="login_redirect">
                    Pas encore de compte ? <Link to="/register">Créer un compte</Link>
                </p>
            </div>
        </main>
    );
}

export default Login;