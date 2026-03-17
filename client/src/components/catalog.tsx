import { useEffect, useState } from "react";

function Catalog() {

    const [trees, setTrees] = useState([]);
    const [isLoading, setIsLoading] = useState(true) // Loader de chargement

    useEffect(() => {
        async function fetchTrees() {
            try {
                const response = await fetch('/api/trees/'); // Fetch l'arbre sur la route /api/trees/
                const data = await response.json();
                setTrees(data);
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false) // exécution du loader qu'il y ait un succès ou une erreur
            }
        }
        fetchTrees();
    }, [])



    return (
        isLoading ? <p>Chargement en cours...</p> // Tant que notre objet est vide / pas encore totalement rempli, on affiche un loader de chargement
            : !trees ? <p>Arbres introuvables.</p> // Afficher un message à l'utilisateur en cas d'erreur de chargement de l'arbre
                : // Affiche tout le reste
                <>
                    <h1>Notre catalogue d'arbres</h1>
                    <p className="description_catalog">Découvrez notre sélection de spécimens exceptionnels pour magnifier votre jardin.</p>
                    <section className="filter_catalog">
                        <img src="/filtre.webp" alt="logo de filtre" />
                        <p className="filtre">Filtres</p>
                        <p className="categories">CATEGORIES</p>

                    </section>
                    <section className="section_catalog">
                        {trees.map(tree => (
                            <article className="article_tree" key={tree.id}>
                                <img src={tree.image} alt={tree.name} />
                                {tree.categories.map(tc => ( // Les catégories sont incluses dans chaque arbre grâce à la jointure (include) avec Prisma
                                    <p key={tc.category.id}>{tc.category.name}</p> // Affiche le nom de sa catégorie
                                ))}
                                <h2>{tree.name}</h2>
                                <p className="label_tree">{tree.label}</p>
                                <p className="price_tree">{tree.price}</p>
                                <button className="btn_addCart">Ajouter au panier</button>
                            </article>
                        ))}
                        
                    </section>
                </>
    )
}

export default Catalog