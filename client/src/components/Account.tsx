import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../components/styles/Account.css';

export default function Account() {
    const { user } = useAuth();

    const [firstname, setFirstname] = useState(user?.firstname ?? '');
    const [lastname, setLastname] = useState(user?.lastname ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        };

        setIsLoading(true);
        try {
            // On envoie uniquement les champs remplis
            const body: Record<string, string> = { firstname, lastname, email };
            if (password) body.password = password;

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': localStorage.getItem('csrfToken') || ''
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Erreur lors de la mise à jour');
            };

            setSuccess('Vos informations ont bien été mises à jour.');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        };
    };

    async function handleDeleteAccount() {
        if (!user) {
            return;
        }

        setError('');
        setSuccess('');
        setIsDeleting(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'x-csrf-token': localStorage.getItem('csrfToken') || ''
                },
                credentials: 'include',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Erreur lors de la suppression du compte');
            }

            setIsDeleteModalOpen(false);
            localStorage.removeItem('csrfToken');
            window.location.assign('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            setIsDeleting(false);
        }
    }

    return (
        <main className="profile_wrapper">
            <h1>Mon compte</h1>
            <p className="profile_description">Modifiez vos informations personnelles ci-dessous.</p>

            <div className="profile_layout">

                {/* Carte infos résumé */}
                <aside className="profile_card_summary">
                    <div className="profile_avatar">
                        {user?.firstname?.charAt(0).toUpperCase()}{user?.lastname?.charAt(0).toUpperCase()}
                    </div>
                    <p className="profile_name">{user?.firstname} {user?.lastname}</p>
                    <p className="profile_email">{user?.email}</p>
                    <span className="profile_role_badge">
                        {user?.role === 1 ? 'Administrateur' : 'Membre'}
                    </span>
                </aside>

                {/* Formulaire de modification */}
                <form className="profile_form" onSubmit={handleSubmit} aria-label="Modifier mes informations personnelles">
                    <h4>Informations personnelles</h4>

                    <div className="profile_form_row">
                        <div className="profile_field">
                            <label className="profile_label" htmlFor="profile-firstname">Prénom</label>
                            <input
                                id="profile-firstname"
                                type="text"
                                className="profile_input"
                                value={firstname}
                                onChange={e => setFirstname(e.target.value)}
                                autoComplete="given-name"
                            />
                        </div>
                        <div className="profile_field">
                            <label className="profile_label" htmlFor="profile-lastname">Nom</label>
                            <input
                                id="profile-lastname"
                                type="text"
                                className="profile_input"
                                value={lastname}
                                onChange={e => setLastname(e.target.value)}
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

                    <div className="profile_field">
                        <label className="profile_label" htmlFor="profile-email">Email</label>
                        <input
                            id="profile-email"
                            type="email"
                            className="profile_input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <h4>Changer le mot de passe</h4>
                    <p className="profile_hint">Laissez vide si vous ne souhaitez pas le modifier.</p>

                    <div className="profile_field">
                        <label className="profile_label" htmlFor="profile-password">Nouveau mot de passe</label>
                        <input
                            id="profile-password"
                            type="password"
                            className="profile_input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="profile_field">
                        <label className="profile_label" htmlFor="profile-confirmPassword">Confirmer le mot de passe</label>
                        <input
                            id="profile-confirmPassword"
                            type="password"
                            className={`profile_input ${confirmPassword && password !== confirmPassword ? 'profile_input_error' : ''}`}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="profile_error_inline">Les mots de passe ne correspondent pas.</p>
                        )}
                    </div>

                    {error && <p className="profile_error">{error}</p>}
                    {success && <p className="profile_success">{success}</p>}

                    <div className="profile_actions">
                        <button
                            type="button"
                            className="profile_delete_btn"
                            onClick={() => setIsDeleteModalOpen(true)}
                            disabled={isLoading || isDeleting}
                        >
                            {isDeleting ? 'Suppression...' : 'Supprimer mon compte'}
                        </button>

                        <button type="submit" className="profile_btn" disabled={isLoading || isDeleting}>
                            {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>

            {isDeleteModalOpen && (
                <div className="profile_modal_overlay" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}>
                    <div
                        className="profile_modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-account-title"
                    >
                        <h2 id="delete-account-title" className="profile_modal_title">Supprimer mon compte</h2>
                        <p className="profile_modal_text">
                            Cette action est définitive. Votre compte et les données associées seront supprimés.
                        </p>
                        <div className="profile_modal_actions">
                            <button
                                type="button"
                                className="profile_modal_cancel"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className="profile_modal_confirm"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};
