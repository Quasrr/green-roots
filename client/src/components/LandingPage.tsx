import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Tree } from '../types';
import './LandingPage.css';
import { Leaf, Bird, MountainSnow, ShoppingCart } from 'lucide-react';


function LandingPage() {
    const [trees, setTrees] = useState<Tree[]>([]); //State des arbres

    useEffect(() => {
        async function fetchTrees() {
            try {
                const res = await fetch('http://localhost:3000/api/trees') // Fetch sur la route des arbres de notre api
                const data = await res.json()
                setTrees(data) // Maj du state avec les arbres récupérer
            } catch (error) {
                console.error(error)
            }
        }
        fetchTrees()
    }, []);

    return (
        <>
            <section className="banniere_landing">
                <img src="/banniere.webp" alt="banniere GreenRoots" className="banniere" />
                <div className="banniere_landing_content">
                    <h1>Rejoignez le mouvement GreenRoots</h1>
                    <p className="hero_banniere">Plantez un arbre aujourd'hui pour un avenir plus vert demain. Chaque geste compte pour la restauration de notre biodiversité.</p>
                    <div className="div_buttons_banniere">
                        <Link to="/catalog" className='btn_catalog'>Acheter un arbre</Link>
                        <Link to="/about" className='btn_about'>En savoir plus</Link>
                    </div>
                </div>
            </section>
            <section className="why_choose">
                <h4>Notre mission</h4>
                <h2>Pourquoi nous choisir ?</h2>
                <p className="description_h2">Nous ne nous contentons pas de planter des arbres. Nous restaurons des écosystèmes complets pour un impact durable.</p>
                <section className="article_mission">
                    <article className="article_reasons_choose">
                        <div className="icon_wrapper">
                            <Leaf size={28} color="#1F4D4D" className="logo_article_choose" />
                        </div>
                        <div className="description_article">
                            <h3>Capture de CO2</h3>
                            <p className="description_article_reasons">Chaque arbre planté absorbe en moyenne 22kg de CO2 par an, luttant activement contre le réchauffement climatique.</p>
                        </div></article>
                    <article className="article_reasons_choose">
                        <div className="icon_wrapper">
                            <Bird size={28} color="#1F4D4D" className="logo_article_choose" />
                        </div>
                        <div className="description_article">
                            <h3>Biodiversité</h3>
                            <p className="description_article_reasons">Nous recréons des habitats naturels pour des milliers d'espèces d'oiseaux, d'insectes et de petits mammifères.</p>
                        </div>
                    </article>
                    <article className="article_reasons_choose">
                        <div className="icon_wrapper">
                            <MountainSnow size={28} color="#1F4D4D" className="logo_article_choose" />
                        </div>
                        <div className="description_article">
                            <h3>Restauration des sols</h3>
                            <p className="description_article_reasons">Les racines stabilisent le sol, préviennent l'érosion et restaurent la fertilité naturelle de la terre.</p>
                        </div>
                    </article>
                </section>
            </section>
            <section className="trees_popular">
                <div className="div_h3_link_catalog">
                    <h3 className='h3_trees_popular'>Top arbres populaires</h3>
                    <Link to="/catalog" className='link_catalog'>Voir tout le catalogue</Link>
                </div>
                <section className="section_article_trees">
                    {trees.slice(0, 4).map(tree => (
                        <article key={tree.id} className="article_reasons_choose">
                            <img src={`/${tree.image}`} alt={tree.name} className="chene" />
                            <div className="tree_card_body">
                                <h3 className='title_tree_popular'>{tree.name}</h3>
                                <p className="label_tree">{tree.label}</p>
                            </div>
                            <div className="div_price_cart">
                                <p className="price_tree">{tree.price}€</p>
                                <div className="icon_wrapper_cart">
                                    <ShoppingCart size={18} color="#F6F8F7" className="logo_cart" />
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            </section>
        </>
    )
}

export default LandingPage;