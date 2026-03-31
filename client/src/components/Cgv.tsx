import { Link } from 'react-router-dom';
import '../components/styles/Cgv.css';

function CGV() {
    return (
        <main className="cgv">
            <h1>Conditions Générales de Vente</h1>
            <p className="last_update">Dernière mise à jour : mars 2026</p>

            <section>
                <h2>1. Champ d'application</h2>
                <p>
                    Les présentes conditions générales de vente régissent les commandes passées sur GreenRoots.
                    Toute commande implique l'acceptation des présentes CGV.
                </p>
            </section>

            <section>
                <h2>2. Identité du vendeur</h2>
                <p>
                    GreenRoots est présenté, à la date de mise à jour de cette page, comme un projet pédagogique.
                    Les informations relatives à l'éditeur du site et aux moyens de contact sont disponibles dans les{' '}
                    <Link to="/legals">mentions légales</Link> et sur la page <Link to="/contact">contact</Link>.
                </p>
            </section>

            <section>
                <h2>3. Produits et services</h2>
                <p>
                    GreenRoots propose des commandes d'arbres dans le cadre d'une démarche de reforestation.
                    Les caractéristiques essentielles de chaque offre, notamment la nature de l'arbre et son prix,
                    sont indiquées sur la fiche correspondante.
                </p>
            </section>

            <section>
                <h2>4. Prix</h2>
                <p>
                    Les prix affichés sur le site sont indiqués en euros toutes taxes comprises. Sauf indication
                    contraire, le prix applicable est celui affiché au moment de la validation de la commande.
                </p>
            </section>

            <section>
                <h2>5. Commande</h2>
                <p>Pour passer commande, l'utilisateur doit disposer d'un compte, sélectionner une ou plusieurs offres et valider son panier.</p>
                <p>
                    La commande n'est considérée comme enregistrée qu'après validation du processus de commande sur
                    le site. Un récapitulatif reste accessible depuis l'espace personnel de l'utilisateur.
                </p>
            </section>

            <section>
                <h2>6. Paiement</h2>
                <p>
                    Le paiement intervient au moment de la validation de la commande, selon les modalités proposées
                    sur le site au moment de l'achat. Les CGV ne décrivent pas ici un prestataire de paiement
                    particulier lorsque celui-ci n'est pas effectivement intégré ou identifié sur le site.
                </p>
            </section>

            <section>
                <h2>7. Exécution de la commande</h2>
                <p>
                    Les modalités d'exécution de la commande et, le cas échéant, les informations relatives à la
                    plantation ou au suivi du projet sont celles présentées sur le site au moment de la commande.
                    En l'absence d'indication plus précise, GreenRoots exécute la commande dans un délai raisonnable
                    après sa validation.
                </p>
            </section>

            <section>
                <h2>8. Droit de rétractation</h2>
                <p>
                    Sauf exception légale applicable, le consommateur bénéficie en principe d'un délai de rétractation
                    de 14 jours pour les contrats conclus à distance. Si la prestation commence avant l'expiration de
                    ce délai à la demande expresse du client, les conditions de maintien, de limitation ou de perte du
                    droit de rétractation sont celles prévues par le Code de la consommation.
                </p>
                <p>
                    En conséquence, GreenRoots ne peut pas écarter de manière générale le droit de rétractation sans
                    que les conditions légales correspondantes soient réunies au moment de la commande.
                </p>
            </section>

            <section>
                <h2>9. Réclamations et litiges</h2>
                <p>
                    Pour toute réclamation, l'utilisateur est invité à contacter GreenRoots via la page{' '}
                    <Link to="/contact">contact</Link>.
                </p>
                <p>
                    En cas d'échec d'une réclamation préalable, le consommateur peut recourir gratuitement à un
                    médiateur de la consommation dans les conditions prévues par les articles L612-1 et suivants du
                    Code de la consommation.
                </p>
                <p>
                    Dans le cadre de cette version fictive du projet, le médiateur indiqué à titre d'exemple est :
                    Médiation Consommation France, 10 rue des Tilleuls, 33000 Bordeaux, www.mediation-consommation-france.fr.
                </p>
            </section>
        </main>
    );
}

export default CGV;
