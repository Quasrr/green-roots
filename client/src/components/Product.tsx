import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Tree } from "../types";
import { Leaf, Wind, MapPin } from 'lucide-react';
import { useCart } from "../hooks/useCart";
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import '../components/styles/Product.css';

function Product() {

    const [tree, setTree] = useState<Tree | null>(null); // On reçoit un objet (un arbre) unique potentiellement vide
    const { id } = useParams(); // Récupérer l'id avec le hook params
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loader de chargement
    const [error, setError] = useState(false);
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        async function fetchTreeById() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trees/${id}`); // Fetch l'arbre sur la route /api/trees/:id
                const data = await response.json();
                setTree(data);
            } catch (error) {
                console.error(error)
                setError(true)
            } finally {
                setIsLoading(false) // exécution du loader qu'il y ait un succès ou une erreur
            }
        }
        fetchTreeById();
    }, [id]) // Relancer l'arbre si l'id change

    if (isLoading) return <p>Chargement en cours...</p> // Tant que notre objet est vide / pas encore totalement rempli, on affiche un loader de chargement
    if (error) return <p>Erreur de chargement.</p>
    if (!tree) return <p>Arbre introuvable.</p> // Afficher un message à l'utilisateur en cas d'erreur de chargement de l'arbre

    return (
        <main className="main_product">
            <img src={`/${tree.image}`} alt={tree.name} className="product_banner" />
            <div className="add_cart_tree">
                <h2>{tree.name}</h2>
                <div className="add_cart_right">
                    <div className="price_stock_row">
                        <p className="price_tree">{tree.price}€</p>
                        <span className={`stock_badge ${tree.quantity > 0 ? 'in_stock' : 'out_stock'}`}>
                            {tree.quantity > 0 ? 'EN STOCK' : 'RUPTURE'}
                        </span>
                    </div>
                    <button
                        className="btn_add_to_cart"
                        onClick={() => {
                            if (!isLoggedIn) {
                                toast.error('Veuillez vous identifier pour accéder au panier');
                                return;
                            }
                            addToCart(tree);
                        }}
                        disabled={tree.quantity <= 0}
                    >
                        Ajouter au panier
                    </button>
                </div>
            </div>
            <section className="impact">
                <article className="impact_tree">
                    <div className="div_wrap_logo_prodimpact">
                        <Wind size={48} color="#1F4D4D" className="logo_article_choose" />
                        <h3>Oxygène produit</h3>
                    </div>
                    <p className="impact_tree_specimen">{tree.impact_o2}L/jour</p>
                    <p className="description_impact">Production moyenne d'oxygène pour un spécimen mature en pleine saison de croissance.</p>
                </article>
                <article className="impact_tree">
                    <div className="div_wrap_logo_prodimpact">
                        <Leaf size={48} color="#1F4D4D" className="logo_article_choose" />
                        <h3>Dioxyde de carbone capté</h3>
                    </div>
                    <p className="impact_tree_specimen">{tree.impact_co2}kg/an</p>
                    <p className="description_impact">Absorption de carbone estimée sur un cycle de croissance de 10 ans.</p>
                </article>
            </section >
            <section className="section_description_tree">
                <h4>Description</h4>
                <p className="description_tree">{tree.description}</p>
                <div className="measure_tree">
                    <div className="measure_tree_value">
                        <p className="information_tree">HAUTEUR ADULTE</p>
                        <p className="information_tree_value">{tree.height}m</p>
                    </div>
                    <div className="measure_tree_value">
                        <p className="information_tree">CROISSANCE</p>
                        <p className="information_tree_value">{{ slow: 'Lente', medium: 'Moyenne', fast: 'Rapide' }[tree.growth]}</p>
                    </div>
                    <div className="measure_tree_value">
                        <p className="information_tree">EXPOSITION</p>
                        <p className="information_tree_value">{tree.exposition}</p>
                    </div>
                    <div className="measure_tree_value">
                        <p className="information_tree">ZONE DE RUSTICITE</p>
                        <p className="information_tree_value">{tree.rusticity}</p>
                    </div>
                </div>
                <section className="section_map_tree">
                    <div className="wrap_div_map">
                        <MapPin size={48} color="#1F4D4D" className="logo_article_choose" />
                        <h3 className="h3_map">Aire d'origine & répartition</h3>
                    </div>
                    <img src="/map.png" alt="carte du monde d'origine des arbres" className="map_img" />
                    <div className="description_map">
                        <p className="origin">Origine de l'arbre : {tree.country}</p>
                        <p className="description_origin">Cultivé durablement dans notre pépinière</p>
                    </div>
                </section>
            </section >
        </main>
    )
}

export default Product
