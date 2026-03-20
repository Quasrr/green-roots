import '../components/styles/Cgv.css';

function CGV() {
    return (
        <main className="cgv">
            <h1>Conditions Générales de Vente</h1>
            <p className="last_update">Dernière mise à jour : mars 2026</p>

            <section>
                <h2>1. Objet</h2>
                <p>Les présentes conditions générales de vente régissent les ventes d'arbres effectuées sur la plateforme GreenRoots. Toute commande implique l'acceptation pleine et entière des présentes CGV.</p>
            </section>

            <section>
                <h2>2. Produits</h2>
                <p>GreenRoots commercialise des arbres à planter dans le cadre d'une démarche de reforestation. Les caractéristiques de chaque arbre (espèce, impact écologique, prix) sont détaillées sur la fiche produit correspondante.</p>
            </section>

            <section>
                <h2>3. Prix</h2>
                <p>Les prix sont indiqués en euros toutes taxes comprises. GreenRoots se réserve le droit de modifier ses prix à tout moment. Les commandes sont facturées sur la base des tarifs en vigueur au moment de la validation.</p>
            </section>

            <section>
                <h2>4. Commande</h2>
                <p>Pour passer une commande, l'utilisateur doit :</p>
                <ul>
                    <li>Disposer d'un compte GreenRoots</li>
                    <li>Sélectionner un ou plusieurs arbres depuis le catalogue</li>
                    <li>Valider son panier et procéder au paiement</li>
                </ul>
                <p>La commande est confirmée après validation du paiement. Un récapitulatif est accessible depuis l'historique des commandes.</p>
            </section>

            <section>
                <h2>5. Paiement</h2>
                <p>Le paiement est sécurisé et traité via Stripe. GreenRoots ne stocke aucune donnée bancaire. Les moyens de paiement acceptés sont les cartes bancaires Visa et Mastercard.</p>
            </section>

            <section>
                <h2>6. Rétractation</h2>
                <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux biens dont la nature ne permet pas le retour. La plantation d'un arbre étant un acte irréversible, les commandes validées ne peuvent faire l'objet d'un remboursement.</p>
            </section>

            <section>
                <h2>7. Responsabilité</h2>
                <p>GreenRoots s'engage à planter les arbres commandés dans les zones de reforestation définies. GreenRoots ne saurait être tenu responsable de facteurs environnementaux indépendants de sa volonté (sécheresse, incendie, etc.).</p>
            </section>

            <section>
                <h2>8. Litiges</h2>
                <p>En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux français seront seuls compétents.</p>
            </section>
        </main>
    )
}

export default CGV