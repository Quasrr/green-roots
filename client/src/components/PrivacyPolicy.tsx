import { Link } from 'react-router-dom';
import '../components/styles/PrivacyPolicy.css'

function PrivacyPolicy() {
    return (
        <main className="privacy_policy">
            <h1>Politique de confidentialité</h1>
            <p className="last_update">Dernière mise à jour : mars 2026</p>

            <section>
                <h2>1. Responsable du traitement</h2>
                <p>GreenRoots est responsable du traitement de vos données personnelles collectées via cette plateforme.</p>
            </section>

            <section>
                <h2>2. Données collectées</h2>
                <p>Lors de votre inscription et utilisation de la plateforme, nous collectons les données suivantes :</p>
                <ul>
                    <li>Nom et prénom</li>
                    <li>Adresse e-mail</li>
                    <li>Mot de passe (hashé, jamais stocké en clair)</li>
                    <li>Historique de commandes</li>
                </ul>
            </section>

            <section>
                <h2>3. Finalité du traitement</h2>
                <p>Vos données sont utilisées exclusivement pour :</p>
                <ul>
                    <li>Gérer votre compte utilisateur</li>
                    <li>Traiter et suivre vos commandes</li>
                    <li>Respecter nos obligations légales</li>
                </ul>
            </section>

            <section>
                <h2>4. Durée de conservation</h2>
                <p>Vos données sont conservées le temps de l'existence de votre compte. <br /> Elles sont supprimées intégralement lors de la suppression de votre compte.</p>
            </section>

            <section>
                <h2>5. Vos droits</h2>
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul>
                    <li><strong>Droit d'accès</strong> — consulter vos données depuis votre espace personnel</li>
                    <li><strong>Droit de rectification</strong> — modifier vos informations depuis votre compte</li>
                    <li><strong>Droit à l'effacement</strong> — supprimer votre compte et toutes vos données</li>
                    <li><strong>Droit d'opposition</strong> — vous opposer à tout traitement de vos données</li>
                </ul>
                <p>Pour exercer ces droits, rendez-vous dans <Link to="/login">votre espace personnel</Link> ou contactez-nous.</p>
            </section>

            <section>
                <h2>6. Sécurité</h2>
                <p>Vos mots de passe sont hashés avec argon2. <br /> Aucune donnée sensible n'est stockée en clair. <br /> Les échanges sont sécurisés via HTTPS.</p>
            </section>

            <section>
                <h2>7. Cookies</h2>
                <p>GreenRoots utilise uniquement des cookies techniques nécessaires <br /> au fonctionnement de l'authentification (token JWT en cookie httpOnly).<br />  Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
            </section>
        </main>
    )
}

export default PrivacyPolicy;