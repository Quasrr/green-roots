import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Tree } from "../types";
import { Leaf, Wind, MapPin, TriangleAlert } from 'lucide-react';
import { useCart } from "../hooks/useCart";
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../components/styles/Product.css';

// Fix pour l'icône par défaut de Leaflet (bug connu avec les bundlers comme Vite)
// Sans ça, le marqueur ne s'affiche pas correctement
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

// Coordonnées GPS [latitude, longitude] pour chaque pays d'origine
// On les stocke ici directement 
const countryCoordinates: Record<string, [number, number]> = {
    "France": [46.6034, 2.2137],
    "Italie": [41.8719, 12.5674],
    "Japon": [36.2048, 138.2529],
    "Chine": [35.8617, 104.1954],
    "Canada": [56.1304, -106.3468],
    "Espagne": [40.4637, -3.7492],
    "Europe": [50.1109, 9.6824],
    "Allemagne": [51.1657, 10.4515],
    "Brésil": [-14.2350, -51.9253],
    "États-Unis": [37.0902, -95.7129],
    "Australie": [-25.2744, 133.7751],
    "Inde": [20.5937, 78.9629],
    "Maroc": [31.7917, -7.0926],
    "Portugal": [39.3999, -8.2245],
    "Royaume-Uni": [55.3781, -3.4360],
};

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
                        <span className={`stock_badge ${tree.quantity <= 0 ? 'out_stock' : tree.quantity <= 10 ? 'low_stock' : 'in_stock'}`}>
                            {tree.quantity <= 0 && 'RUPTURE'}
                            {tree.quantity > 0 && tree.quantity <= 10 && (
                                <><TriangleAlert size={14} /> PLUS QUE {tree.quantity} EN STOCK</>
                            )}
                            {tree.quantity > 10 && 'EN STOCK'}
                        </span>
                    </div>
                    <button
                        className="btn_add_to_cart"
                        onClick={() => {
                            if (!isLoggedIn) {
                                toast.error('Veuillez vous identifier pour accéder au panier', { id: 'auth-required' });
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
                    {/* MapContainer = le composant principal de Leaflet qui crée la carte */}
                    {/* center = coordonnées GPS du pays, zoom = niveau de zoom initial */}
                    <MapContainer
                        center={countryCoordinates[tree.country] || [20, 0]}
                        zoom={4}
                        className="map_leaflet"
                        scrollWheelZoom={false}
                    >
                        {/* TileLayer = les images de fond de carte (ici OpenStreetMap, gratuit) */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* Marker = le point rouge sur la carte, Popup = la bulle au clic */}
                        {countryCoordinates[tree.country] && (
                            <Marker position={countryCoordinates[tree.country]}>
                                <Popup>{tree.name} — Origine : {tree.country}</Popup>
                            </Marker>
                        )}
                    </MapContainer>
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
