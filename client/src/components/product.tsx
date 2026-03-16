import { useEffect, useState } from "react"

function Product() {

    const [tree, setTree] = useState([])

    useEffect(() => {
        async function fetchTreeById() {
            try {
                const response = await fetch('/api/trees/:id');
                const data = await response.json();
                setTree(data);
            } catch (error) {
                console.error(error)
            }
        }
        fetchTreeById();
    })

    return (
        <>
            <img src={tree.image} alt={tree.name} className="product_banner" />
            <div className="add_cart_tree">
                <h2>{tree.name}</h2>
                <p className="price_tree">{tree.price}€ quantité: {tree.quantity}</p>
                <button className="btn_addCart">Ajouter au panier</button>
            </div>
            <section className="impact">
                <article className="impact_tree">
                    <img src="/wind.webp" alt="logo vent" />
                    <h3>Production d'oxygène</h3>
                    <p className="impact_tree_specimen">{tree.impact_o2}L/jour</p>
                    <p className="description_impact">Production moyenne d'oxygène pour un spécimen mature en pleine saison de croissance.</p>
                </article>
                <article className="impact_tree">
                    <img src="/leaf.webp" alt="logo feuille" />
                    <h3>Captation du dioxyde de carbone</h3>
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
                        <p className="information_tree_value">{tree.heigth}</p>
                    </div>
                    <div className="measure_tree_value">
                        <p className="information_tree">CROISSANCE</p>
                        <p className="information_tree_value">{tree.growth}</p>
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
                    <img src="/logoMap.webp" alt="logo geoposition" />
                    <img src="/map.webp" alt="carte du monde d'origine des arbres" />
                    <div className="description_map">
                        <p className="origin">Origine de l'arbre : {tree.country}</p>
                        <p className="description_origin">Cultivé durablement dans notre pépinière</p>
                    </div>
                </section>
            </section >
        </>
    )
}

export default Product