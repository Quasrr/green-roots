import { useActionState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import './styles/PasswordReset.css';

async function readErrorMessage(response: Response, fallback: string) {
    try {
        const data = await response.json() as { message?: string };
        return data.message || fallback;
    } catch {
        return fallback;
    }
}

function ForgotPassword() {
    async function forgotPasswordAction(_prev: string, formData: FormData) {
        const email = String(formData.get('email') || '').trim();

        if (!email) {
            toast.error('Veuillez renseigner votre adresse email', { id: 'forgot-password-error' });
            return '';
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': localStorage.getItem('csrfToken') || '',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const message = await readErrorMessage(response, 'Impossible d\'envoyer le lien de réinitialisation');
                toast.error(message, { id: 'forgot-password-error' });
                return '';
            }

            toast.success('Si ce compte existe, un lien de réinitialisation a été envoyé', {
                id: 'forgot-password-success',
            });
            return email;
        } catch {
            toast.error('Une erreur est survenue. Réessayez dans un instant', { id: 'forgot-password-error' });
            return '';
        }
    }

    const [submittedEmail, action, isPending] = useActionState(forgotPasswordAction, '');

    return (
        <main className="password_reset_wrapper">
            <div className="password_reset_card">
                <h1>Mot de passe oublié</h1>
                <p className="password_reset_description">
                    Saisissez votre adresse email pour recevoir un lien de réinitialisation
                </p>

                <form className="password_reset_form" action={action} aria-label="Formulaire de demande de réinitialisation">
                    <div className="password_reset_field">
                        <label className="password_reset_label" htmlFor="forgot-password-email">Email</label>
                        <input
                            id="forgot-password-email"
                            name="email"
                            type="email"
                            className="password_reset_input"
                            placeholder="votre@email.fr"
                            autoComplete="email"
                            defaultValue={submittedEmail}
                        />
                    </div>

                    <button type="submit" className="password_reset_btn" disabled={isPending}>
                        {isPending ? 'Envoi...' : 'Recevoir le lien'}
                    </button>
                </form>

                {submittedEmail && (
                    <p className="password_reset_notice">
                        Si l'adresse <strong>{submittedEmail}</strong> correspond à un compte existant, un email va vous être envoyé dans quelques instants.
                    </p>
                )}

                <p className="password_reset_redirect">
                    Vous avez retrouvé vos accès ? <Link to="/login">Retour à la connexion</Link>
                </p>
            </div>
        </main>
    );
}

export default ForgotPassword;
