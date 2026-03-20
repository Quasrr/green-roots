import '../components/styles/About.css';

import { Leaf, Users, TreePine, Heart } from 'lucide-react';

function About() {
    return (
        <main className="about_wrapper">

            <section className="about_hero">
                <h1>Notre mission</h1>
                <p className="about_hero_description">GreenRoots est né d'une conviction simple : chaque arbre planté est un geste concret pour la planète. Nous rendons la reforestation accessible à tous.</p>
            </section>

            <section className="about_values">
                <h2>Nos valeurs</h2>
                <div className="about_values_list">
                    <article className="about_value_card">
                        <div className="about_icon_wrapper">
                            <Leaf size={32} color="#1A4231" />
                        </div>
                        <h3>Engagement écologique</h3>
                        <p>Chaque arbre acheté est planté dans une zone de reforestation certifiée. Nous suivons l'impact de chaque plantation.</p>
                    </article>
                    <article className="about_value_card">
                        <div className="about_icon_wrapper">
                            <Users size={32} color="#1A4231" />
                        </div>
                        <h3>Accessibilité</h3>
                        <p>Particuliers, entreprises, associations — GreenRoots s'adresse à tous ceux qui souhaitent agir concrètement pour l'environnement.</p>
                    </article>
                    <article className="about_value_card">
                        <div className="about_icon_wrapper">
                            <TreePine size={32} color="#1A4231" />
                        </div>
                        <h3>Transparence</h3>
                        <p>Nous publions l'avancement des plantations et l'impact environnemental de chaque projet soutenu par notre communauté.</p>
                    </article>
                    <article className="about_value_card">
                        <div className="about_icon_wrapper">
                            <Heart size={32} color="#1A4231" />
                        </div>
                        <h3>Impact durable</h3>
                        <p>Nos espèces sont sélectionnées pour leur adaptation au terrain local et leur capacité à soutenir la biodiversité sur le long terme.</p>
                    </article>
                </div>
            </section>

            <section className="about_team">
                <h2>L'équipe</h2>
                <p className="about_team_description">GreenRoots est développé par une équipe de 3 personnes dans le cadre d'un Titre Professionnel Concepteur Développeur d'Applications.</p>
                <div className="about_team_list">
                    <article className="about_team_card">
                        <div className="about_team_avatar">T</div>
                        <h3>Tony</h3>
                        <p className="about_team_role">Lead Developer</p>
                        <p className="about_team_desc">Architecture technique, backend, intégration Stripe et gestion Git.</p>
                    </article>
                    <article className="about_team_card">
                        <div className="about_team_avatar">S</div>
                        <h3>Seb</h3>
                        <p className="about_team_role">Scrum Master</p>
                        <p className="about_team_desc">Méthodologie Agile, organisation des sprints et suivi des livrables.</p>
                    </article>
                    <article className="about_team_card">
                        <div className="about_team_avatar">B</div>
                        <h3>Bruno</h3>
                        <p className="about_team_role">Product Owner</p>
                        <p className="about_team_desc">Vision produit, backlog, user stories et cohérence des specs.</p>
                    </article>
                </div>
            </section>
        </main>
    )
}

export default About