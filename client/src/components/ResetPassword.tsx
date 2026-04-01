import { useActionState, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import './styles/PasswordReset.css';

const PASSWORD_HINT = '8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

async function readErrorMessage(response: Response, fallback: string) {
    try {
        const data = await response.json() as { message?: string };
        return data.message || fallback;
    } catch {
        return fallback;
    }
}

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const token = searchParams.get('token') || '';

    async function resetPasswordAction(_prev: string, formData: FormData) {
        if (!token) {
            toast.error('Le lien de réinitialisation est invalide.', { id: 'reset-password-error' });
            return '';
        }

        const newPassword = String(formData.get('password') || '');
        const confirmation = String(formData.get('confirmPassword') || '');

        if (!PASSWORD_REGEX.test(newPassword)) {
            toast.error(PASSWORD_HINT, { id: 'reset-password-error' });
            return '';
        }

        if (newPassword !== confirmation) {
            toast.error('Les mots de passe ne correspondent pas.', { id: 'reset-password-error' });
            return '';
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': localStorage.getItem('csrfToken') || '',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                const message = await readErrorMessage(response, 'Impossible de réinitialiser le mot de passe.');
                toast.error(message, { id: 'reset-password-error' });
                return '';
            }

            toast.success('Votre mot de passe a bien été mis à jour.', { id: 'reset-password-success' });
            navigate('/login');
            return '';
        } catch {
            toast.error('Une erreur est survenue. Réessayez dans un instant.', { id: 'reset-password-error' });
            return '';
        }
    }

    const [, action, isPending] = useActionState(resetPasswordAction, '');

    if (!token) {
        return (
            <main className="password_reset_wrapper">
                <div className="password_reset_card">
                    <span className="password_reset_kicker">Lien invalide</span>
                    <h1>Réinitialisation impossible</h1>
                    <p className="password_reset_description">
                        Ce lien est incomplet ou expiré. Demandez un nouveau lien pour réinitialiser votre mot de passe.
                    </p>
                    <div className="password_reset_actions">
                        <Link to="/forgot-password" className="password_reset_btn password_reset_btn_link">
                            Demander un nouveau lien
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="password_reset_wrapper">
            <div className="password_reset_card">
                <h1>Nouveau mot de passe</h1>
                <p className="password_reset_description">
                    Choisissez un mot de passe robuste pour sécuriser de nouveau votre compte GreenRoots.
                </p>

                <form className="password_reset_form" action={action} aria-label="Formulaire de réinitialisation du mot de passe">
                    <div className="password_reset_field">
                        <label className="password_reset_label" htmlFor="reset-password">Nouveau mot de passe</label>
                        <input
                            id="reset-password"
                            name="password"
                            type="password"
                            className="password_reset_input"
                            placeholder="********"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>

                    <div className="password_reset_field">
                        <label className="password_reset_label" htmlFor="reset-password-confirm">Confirmer le mot de passe</label>
                        <input
                            id="reset-password-confirm"
                            name="confirmPassword"
                            type="password"
                            className={`password_reset_input ${confirmPassword && password !== confirmPassword ? 'password_reset_input_error' : ''}`}
                            placeholder="********"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                        <p className="password_reset_hint">{PASSWORD_HINT}</p>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="password_reset_error">Les mots de passe ne correspondent pas.</p>
                        )}
                    </div>

                    <button type="submit" className="password_reset_btn" disabled={isPending}>
                        {isPending ? 'Validation...' : 'Mettre à jour le mot de passe'}
                    </button>
                </form>

                <p className="password_reset_redirect">
                    Vous vous souvenez de votre mot de passe ? <Link to="/login">Retour à la connexion</Link>
                </p>
            </div>
        </main>
    );
}

export default ResetPassword;
