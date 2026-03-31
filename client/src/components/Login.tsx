import { useActionState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import '../components/styles/Login.css';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    async function loginAction(_prev: string, formData: FormData) {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await login(email, password);
            toast.success("Vous êtes connecté", { id: 'login-success' });
            navigate('/');
            return '';
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Une erreur est survenue', { id: 'login-error' }) // toast.error retourne un id de toast(number)
            return ''; // Return obligatoire car useActionState attend que la fct return quelque chose, comme on ignore l'état avec ',' TS exige quand meme le return
        }
    }

    const [, action, isPending] = useActionState(loginAction, '');

    return (
        <main className="login_wrapper">
            <div className="login_card">
                <h1>Connexion</h1>
                <p className="login_description">Accédez à votre espace personnel GreenRoots.</p>

                <form className="login_form" action={action} aria-label="Formulaire de connexion">
                    <div className="login_field">
                        <label className="login_label" htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            className="login_input"
                            placeholder="votre@email.fr"
                            autoComplete="email"
                        />
                    </div>
                    <div className="login_field">
                        <label className="login_label" htmlFor="login-password">Mot de passe</label>
                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            className="login_input"
                            placeholder="********"
                            autoComplete="current-password"
                        />
                    </div>
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