import { useEffect, useState } from "react";
import type { Category, Tree } from "../types";
import { ShoppingCart } from 'lucide-react';

import './Catalog.css'

function Catalog() {

    const [trees, setTrees] = useState<Tree[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loader de chargement
    const [idSelectedCategories, setIdSelectedCategories] = useState<number[]>([]); // Tableau des id de categories
    const [maxPrice, setMaxPrice] = useState<number>(300); // Pour le curseur de prix
    const [inStockOnly, setInStockOnly] = useState<boolean>(false); // Checkbox de stock
    const [error, setError] = useState<boolean>(false); // State d'erreur dans le ternaire
    const [currentPage, setCurrentPage] = useState<number>(1); // AJOUT PAGINATION - page courante
    const itemsPerPage = 9; // AJOUT PAGINATION - 9 arbres par page (grille 3x3)

    useEffect(() => {
        async function fetchTrees() {
            try {
                const response = await fetch('http://localhost:3000/api/trees/') // Fetch l'arbre sur la route /api/trees/
                const data = await response.json()
                setTrees(data)
            } catch (error) {
                console.error(error)
                setError(true) // on signale l'erreur en la passant à true
            } finally {
                setIsLoading(false) // exécution du loader qu'il y ait un succès ou une erreur
            }
        }
        fetchTrees()
    }, [])

    // === Partie filtre des catégories ===
    // Extraire uniquement le tableau d'objet Catégory depuis le tableau [Tree] (avec des doublons de catégorie)
    const allCategoriesWithDoublons = trees.flatMap(tree => tree.categories)
    // Résultat : [{ id: 1, name: "Fruitier" }, { id: 3, name: "Mabrouk" }, ...]

    // Avoir un nom de catégorie unique dans son tableau
    const categories: Category[] = []
    allCategoriesWithDoublons.forEach(cat => {
        const categoriesPresente = categories.some(c => c.id === cat.id) // (Boolean) Tester l'id d'une catégorie dans le tableau categories VS l'id de la catégorie qui se fait tester
        if (!categoriesPresente) { // categoriesPresente = False ==> on ajoute au tableau
            categories.push(cat)
        }
    });

    // Filtrer en cochant / décochant une catégorie 
    function chooseCategory(id: number) { // id de la catégorie sur laquelle on a cliqué va en param
        setCurrentPage(1); // AJOUT PAGINATION - reset page quand on change de filtre
        const idDejaSelectionnee = idSelectedCategories.includes(id) // true si l'id est déjà dans le tableau, false sinon

        if (idDejaSelectionnee) { // catégorie cochée
            setIdSelectedCategories(idSelectedCategories.filter(c => c !== id)) // retirer la catégorie déjà cochée (grâce à son id) tout en gardant les autres catégories
        } else { // catégorie pas cochée
            setIdSelectedCategories([...idSelectedCategories, id]) // on recopie le tableau existant et on ajoute le nouvel id à la fin
        }
    };

    // === Partie filtre des arbres ===
    const filteredTrees = trees.filter(tree => {

        const noCategorySelected = idSelectedCategories.length === 0 // Si aucune catégorie cochée (true) = on affiche tout
        const treeInCategory = tree.categories.some(cat => idSelectedCategories.includes(cat.id)) // Si l'arbre appartient à une catégorie cochée (true) — directement cat.id sans passer par tc.category.id

        const matchCategory = noCategorySelected || treeInCategory // passe si aucun filtre est actif OU si l'arbre correspond
        const matchPrice = tree.price <= maxPrice // passe si le prix de l'arbre est inférieur ou égal au max du slider (300)
        const matchStock = !inStockOnly || tree.quantity > 0 // passe si le filtre stock est inactif OU si l'arbre est en stock

        return matchCategory && matchPrice && matchStock // l'arbre s'affiche uniquement si les 3 conditions sont remplies
    })

    // AJOUT PAGINATION - calcul du nombre total de pages et découpage du tableau
    const totalPages = Math.ceil(filteredTrees.length / itemsPerPage);
    const paginatedTrees = filteredTrees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        isLoading ? <p>Chargement en cours...</p>
            : error ? <p>Arbres introuvables.</p>
                :
                <div className="catalog_layout">

                    {/* Sidebar filtres */}
                    <aside className="filter_catalog">
                        <p className="filtre">Filtres</p>

                        <p className="categories">CATÉGORIES</p>
                        {categories.map(category => (
                            <button key={category.id}
                                className={`category_btn ${idSelectedCategories.includes(category.id) ? 'active' : ''}`}
                                onClick={() => chooseCategory(category.id)}>
                                {category.name}
                            </button>
                        ))}

                        <p className="categories">PRIX (0€ - 300€)</p>
                        <div className="slider_wrapper">
                            <input type="range" min={0} max={300} value={maxPrice} onChange={e => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }} /> {/* Convertir la value de l'input string en number pour la comparaison sur matchPrice + reset page 👈 AJOUT PAGINATION */}
                            <div className="slider_labels">
                                <span>0€</span>
                                <span>{maxPrice}€</span>
                            </div>
                        </div>

                        <p className="categories">DISPONIBILITÉ</p>
                        <label className="stock_label">
                            <input type="checkbox" checked={inStockOnly} onChange={e => { setInStockOnly(e.target.checked); setCurrentPage(1); }} /> {/* reset page au changement de filtre stock 👈 AJOUT PAGINATION */}
                            En stock uniquement
                        </label>
                    </aside>

                    {/* Contenu principal */}
                    <main className="catalog_main">
                        <h1>Notre Catalogue d'Arbres</h1>
                        <p className="description_catalog">Découvrez notre sélection de spécimens exceptionnels pour magnifier votre jardin.</p>

                        <section className="section_catalog">
                            {paginatedTrees.map(tree => ( // AJOUT PAGINATION - paginatedTrees à la place de filteredTrees
                                <article className="article_tree" key={tree.id}>
                                    <div className="article_tree_img_wrapper">
                                        <img src={tree.image} alt={tree.name} />
                                        {tree.categories.map(category => (
                                            <span key={category.id} className="category_badge">{category.name}</span>
                                        ))}
                                    </div>
                                    <div className="article_tree_info">
                                        <h2>{tree.name}</h2>
                                        <p className="label_tree">{tree.label}</p>
                                        <div className="price_cart_row">
                                            <p className="price_tree">{tree.price}€</p>
                                            <div className="icon_wrapper_cart">
                                                <ShoppingCart size={32} color="#F6F8F7" className="logo_cart" />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </section>

                        {/* 👈 AJOUT PAGINATION - boutons de pagination, affichés uniquement si plus d'une page */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>←</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={currentPage === page ? 'active' : ''}>
                                        {page}
                                    </button>
                                ))}
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>→</button>
                            </div>
                        )}
                    </main>
                </div>
    )
}

export default Catalog;