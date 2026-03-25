import { Link } from 'react-router-dom';
import '../components/styles/Cookies.css';

export default function Cookies() {
    return (
        <main className="cookies_policy">
            <h1>Politique de cookies</h1>
            <p className="last_update">Dernière mise à jour : mars 2026</p>

            <section>
                <h2>1. Définition</h2>
                <p>
                    Un cookie est un petit fichier enregistré sur votre terminal lors de votre navigation.
                    Sur GreenRoots, les cookies déposés ont uniquement une finalité technique et de sécurité.
                </p>
            </section>

            <section>
                <h2>2. Cookies utilisés</h2>
                <p>GreenRoots n'utilise aucun cookie publicitaire, de mesure d'audience ou de suivi marketing.</p>

                <div className="cookies_table_wrapper">
                    <table className="cookies_table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Finalité</th>
                                <th>Durée</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>access_token</td>
                                <td>Maintenir votre session authentifiée sur les routes API protégées</td>
                                <td>1 heure maximum</td>
                            </tr>
                            <tr>
                                <td>refresh_token</td>
                                <td>Renouveler la session sans vous reconnecter à chaque action</td>
                                <td>7 jours maximum</td>
                            </tr>
                            <tr>
                                <td>csrfToken</td>
                                <td>Protéger les formulaires et actions sensibles contre les attaques CSRF</td>
                                <td>Cookie de session</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2>3. Caractéristiques</h2>
                <ul>
                    <li>Les cookies d'authentification sont utilisés uniquement pour sécuriser l'accès à votre compte.</li>
                    <li>Les cookies `access_token` et `refresh_token` sont définis comme `httpOnly` et ne sont pas accessibles via JavaScript.</li>
                    <li>Les cookies sont configurés avec `sameSite=lax` pour limiter les usages inter-sites non souhaités.</li>
                    <li>En production, ils sont transmis en mode sécurisé (`secure`) via HTTPS.</li>
                </ul>
            </section>

            <section>
                <h2>4. Consentement</h2>
                <p>
                    Ces cookies étant strictement nécessaires au fonctionnement et à la sécurité du service,
                    leur dépôt ne requiert pas de consentement préalable au sens de la réglementation applicable.
                </p>
            </section>

            <section>
                <h2>5. Gestion des cookies</h2>
                <p>
                    Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies. Toutefois,
                    la désactivation des cookies techniques de GreenRoots peut empêcher la connexion à votre compte
                    et le bon fonctionnement des fonctionnalités protégées.
                </p>
            </section>

            <section>
                <h2>6. En savoir plus</h2>
                <p>
                    Pour plus d'informations sur le traitement de vos données personnelles, consultez notre{' '}
                    <Link to="/privacy-policy">politique de confidentialité</Link>.
                </p>
            </section>
        </main>
    );
}