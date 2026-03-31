import { Link } from 'react-router-dom';
import '../components/styles/Cookies.css';

export default function Cookies() {
    return (
        <main className="cookies_policy">
            <h1>Politique de gestion des cookies</h1>
            <p className="last_update">Dernière mise à jour : mars 2026</p>

            <section>
                <h2>1. Objet</h2>
                <p>
                    Cette page décrit les cookies et traceurs utilisés sur GreenRoots. À la date de mise à jour
                    indiquée ci-dessus, GreenRoots dépose uniquement des cookies internes strictement nécessaires
                    à l'authentification, au maintien de session et à la sécurité des requêtes.
                </p>
            </section>

            <section>
                <h2>2. Cookies utilisés</h2>
                <p>
                    GreenRoots n'utilise pas, à ce jour, de cookies publicitaires, de mesure d'audience,
                    de personnalisation marketing ou de suivi cross-site.
                </p>

                <div className="cookies_table_wrapper">
                    <table className="cookies_table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Émetteur</th>
                                <th>Finalité</th>
                                <th>Durée</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>access_token</td>
                                <td>GreenRoots</td>
                                <td>Permettre l'accès aux zones connectées pendant la session authentifiée</td>
                                <td>1 heure maximum</td>
                            </tr>
                            <tr>
                                <td>refresh_token</td>
                                <td>GreenRoots</td>
                                <td>Renouveler la session sans imposer une reconnexion immédiate</td>
                                <td>7 jours maximum</td>
                            </tr>
                            <tr>
                                <td>csrfToken</td>
                                <td>GreenRoots</td>
                                <td>Protéger les actions sensibles contre les attaques de type CSRF</td>
                                <td>Cookie de session</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2>3. Consentement</h2>
                <p>
                    Ces cookies sont utilisés parce qu'ils sont strictement nécessaires à la fourniture du service
                    demandé par l'utilisateur et à la sécurité de l'authentification. À ce titre, ils ne donnent
                    pas lieu à un recueil de consentement préalable. En revanche, GreenRoots vous informe de leur
                    existence, de leur finalité et de leur durée de conservation sur cette page.
                </p>
            </section>

            <section>
                <h2>4. Gestion des cookies</h2>
                <p>
                    Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies. Toutefois,
                    la désactivation des cookies strictement nécessaires de GreenRoots peut empêcher la connexion
                    à votre compte ou le bon fonctionnement des fonctionnalités sécurisées.
                </p>
            </section>

            <section>
                <h2>5. En savoir plus</h2>
                <p>
                    Pour les informations relatives au traitement des données personnelles associé aux cookies
                    utilisés sur GreenRoots, notamment l'identité du responsable du traitement et vos droits,
                    consultez notre <Link to="/privacy-policy">politique de confidentialité</Link>.
                </p>
            </section>
        </main>
    );
}
