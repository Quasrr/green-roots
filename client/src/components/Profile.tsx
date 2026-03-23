import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../components/styles/Profile.css';

function Profile() {
    const { user } = useAuth();

    const [firstname, setFirstname] = useState(user?.firstname ?? '');
    const [lastname, setLastname] = useState(user?.lastname ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsLoading(true);
        try {
            // On envoie uniquement les champs remplis
            const body: Record<string, string> = { firstname, lastname, email };
            if (password) body.password = password;

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user?.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Erreur lors de la mise à jour');
            }

            setSuccess('Vos informations ont bien été mises à jour.');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
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
                <form className="profile_form" onSubmit={handleSubmit}>
                    <h4>Informations personnelles</h4>

                    <div className="profile_form_row">
                        <div className="profile_field">
                            <label className="profile_label">Prénom</label>
                            <input
                                type="text"
                                className="profile_input"
                                value={firstname}
                                onChange={e => setFirstname(e.target.value)}
                            />
                        </div>
                        <div className="profile_field">
                            <label className="profile_label">Nom</label>
                            <input
                                type="text"
                                className="profile_input"
                                value={lastname}
                                onChange={e => setLastname(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="profile_field">
                        <label className="profile_label">Email</label>
                        <input
                            type="email"
                            className="profile_input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <h4>Changer le mot de passe</h4>
                    <p className="profile_hint">Laissez vide si vous ne souhaitez pas le modifier.</p>

                    <div className="profile_field">
                        <label className="profile_label">Nouveau mot de passe</label>
                        <input
                            type="password"
                            className="profile_input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="profile_field">
                        <label className="profile_label">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            className={`profile_input ${confirmPassword && password !== confirmPassword ? 'profile_input_error' : ''}`}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="profile_error_inline">Les mots de passe ne correspondent pas.</p>
                        )}
                    </div>

                    {error && <p className="profile_error">{error}</p>}
                    {success && <p className="profile_success">{success}</p>}

                    <button type="submit" className="profile_btn" disabled={isLoading}>
                        {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default Profile;
