import { useEffect, useState } from "react";
import type { Category, Tree } from "../types";

function Catalog() {

    const [trees, setTrees] = useState<Tree[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loader de chargement
    const [idSelectedCategories, setIdSelectedCategories] = useState<number[]>([]); // Tableau des id de categories
    const [maxPrice, setMaxPrice] = useState<number>(300); // Pour le curseur de prix
    const [inStockOnly, setInStockOnly] = useState<boolean>(false); // Checkbox de stock
    const [error, setError] = useState<boolean>(false); // State d'erreur dans le ternaire

    useEffect(() => {
        async function fetchTrees() {
            try {
                const response = await fetch('/api/trees/')// Fetch l'arbre sur la route /api/trees/
                const data = await response.json()
                setTrees(data)
            } catch (error) {
                console.error(error)
                setError(true)// on signale l'erreur en la passant à true
            } finally {
                setIsLoading(false) // exécution du loader qu'il y ait un succès ou une erreur
            }
        }
        fetchTrees()
    }, [])

    // === Partie filtre des catégories ===
    // Extraire uniquement les catégories depuis le tableau [Tree] (avec des doublons de catégorie)
    const allCategoriesWithDoublons = trees.flatMap(tree => // Methode flat + map met tout en un seul tableau ==> [{treeId: 1, categoryId: 2, category: { id: 2, name: "Feuillus" }}]
        tree.categories.map(tc => tc.category) // [{ id: 2, name: "Feuillus" }] / On récupère que l'objet category
    );

    // Avoir un nom de catégorie unique dans son tableau
    const categories: Category[]= []
    allCategoriesWithDoublons.forEach(cat => {
        const categoriesPresente = categories.some(c => c.id === cat.id) // (Boolean) Tester l'id d'une catégorie dans le tableau categories VS l'id de la catégorie qui se fait tester
        if (!categoriesPresente) { // categoriesPresente = False ==> on ajoute au tableau
            categories.push(cat) 
        }
    });

    // Filtrer en cochant / décochant une catégorie 
    function chooseCategory(id: number) { // id de la catégorie sur laquelle on a cliqué va en param

        const idDejaSelectionnee = idSelectedCategories.includes(id) // true si l'id est déjà dans le tableau, false sinon

        if (idDejaSelectionnee) { // catégorie cochée
            setIdSelectedCategories(idSelectedCategories.filter(c => c !== id)) // retirer la catégorie déjà cochée (grâce à son id) tout en gardant les autres catégories
        } else { // catégorie pas cochée
            setIdSelectedCategories([...idSelectedCategories, id]) // ...on recopie le tableau existant et on ajoute le nouvel id à la fin
        }
    };

    // === Partie filtre des arbres ===
    const filteredTrees = trees.filter(tree => {

        const noCategorySelected = idSelectedCategories.length === 0 // Si aucune catégorie cochée (true) = on affiche tout
        const treeInCategory = tree.categories.some(tc => idSelectedCategories.includes(tc.category.id)) // Si l'arbre appartient à une catégorie cochée (true)

        const matchCategory = noCategorySelected || treeInCategory // passe si aucun filtre est actif OU si l'arbre correspond
        const matchPrice = tree.price <= maxPrice // passe si le prix de l'arbre est inférieur ou égal au max du slider (300)
        const matchStock = !inStockOnly || tree.quantity > 0 // passe si le filtre stock est inactif OU si l'arbre est en stock

        return matchCategory && matchPrice && matchStock // l'arbre s'affiche uniquement si les 3 conditions sont remplies
    })

    return (
        isLoading ? <p>Chargement en cours...</p>
            : error ? <p>Arbres introuvables.</p>
                :
                <>
                    <h1>Notre catalogue d'arbres</h1>
                    <p className="description_catalog">Découvrez notre sélection de spécimens exceptionnels pour magnifier votre jardin.</p>

                    <section className="filter_catalog">
                        <img src="/filtre.webp" alt="logo de filtre" />
                        <p className="filtre">Filtres</p>

                        <p className="categories">CATEGORIES</p>
                        {categories.map(categorie =>
                        // Ajoute un bouton cliquable pour chaque catégorie unique présente dans notre tableau
                        (<button key={categorie.id} className={idSelectedCategories.includes(categorie.id) ? 'active' : ''} // Ajout d'une classe en ternaire (active) pour colorisé le bouton cliqué
                            onClick={() => chooseCategory(categorie.id)}>
                            {categorie.name}
                        </button>
                        ))}

                        {/* Slider prix */}
                        <p className="categories">PRIX (0€ - 300€)</p>
                        <input type="range" min={0} max={300} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} /> {/* Convertir la value de l'input string en number pour la comparaison sur matchPrice */}
                        <p>{maxPrice}€</p>

                        {/* Checkbox stock */}
                        <p className="categories">DISPONIBILITÉ</p>
                        <label>
                            <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                            En stock uniquement
                        </label>
                    </section>

                    <section className="section_catalog">
                        {filteredTrees.map(tree => (
                            <article className="article_tree" key={tree.id}>
                                <img src={tree.image} alt={tree.name} />
                                {tree.categories.map(tc => ( // Les catégories sont incluses dans chaque arbre grâce à la jointure (include) avec Prisma
                                    <p key={tc.category.id}>{tc.category.name}</p>
                                ))}
                                <h2>{tree.name}</h2>
                                <p className="label_tree">{tree.label}</p>
                                <p className="price_tree">{tree.price}€</p>
                                <button className="btn_addCart">Ajouter au panier</button>
                            </article>
                        ))}
                    </section>
                </>
    )
}

export default Catalog