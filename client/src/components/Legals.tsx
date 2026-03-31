import { Link } from 'react-router-dom';
import '../components/styles/Legals.css';

export default function Legals() {
    return (
        <main className="legals">
            <h1>Mentions légales</h1>
            <p className="last_update">Dernière mise à jour : mars 2026</p>

            <section>
                <h2>1. Éditeur du site</h2>
                <p>Le site GreenRoots est édité dans le cadre d'un projet pédagogique : Titre Professionnel Concepteur Développeur d'Applications (CDA).</p>
                <ul>
                    <li><strong>Nom du projet :</strong> GreenRoots</li>
                    <li><strong>Équipe :</strong> Tony, Seb, Bruno</li>
                    <li><strong>Contact :</strong> contact@greenroots.fr</li>
                </ul>
            </section>

            <section>
                <h2>2. Hébergement</h2>
                <p>Le site est hébergé par :</p>
                <ul>
                    <li><strong>Société :</strong> OVH SAS</li>
                    <li><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</li>
                    <li><strong>Site web :</strong> <a href="https://www.ovhcloud.com" target="_blank" rel="noreferrer">www.ovhcloud.com</a></li>
                </ul>
            </section>

            <section>
                <h2>3. Propriété intellectuelle</h2>
                <p>L'ensemble des contenus présents sur GreenRoots (textes, images, logos) sont la propriété exclusive de GreenRoots. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
            </section>

            <section>
                <h2>4. Données personnelles</h2>
                <p>
                    Le traitement des données personnelles est détaillé dans notre{' '}
                    <Link to="/privacy-policy">politique de confidentialité</Link>. Conformément au RGPD,
                    vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                </p>
            </section>

            <section>
                <h2>5. Cookies</h2>
                <p>
                    GreenRoots utilise uniquement des cookies techniques nécessaires au fonctionnement de
                    l'authentification et à la sécurité des échanges. Aucun cookie publicitaire ou de tracking
                    n'est déposé sur votre appareil.
                </p>
                <p>
                    Pour le détail des cookies utilisés, consultez notre{' '}
                    <Link to="/cookies">politique de cookies</Link>.
                </p>
            </section>

            <section>
                <h2>6. Limitation de responsabilité</h2>
                <p>GreenRoots s'efforce d'assurer l'exactitude des informations diffusées sur le site. Toutefois, GreenRoots ne peut garantir l'exhaustivité et l'absence d'erreurs des contenus publiés.</p>
            </section>
        </main>
    );
}