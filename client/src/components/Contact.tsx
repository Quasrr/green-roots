import '../components/styles/Contact.css';

function Contact() {
    return (
        <main className="contact_wrapper">
            <h1>Contactez-nous</h1>
            <p className="contact_description">Une question, une suggestion ? Nous vous répondons dans les plus brefs délais.</p>

            <div className="contact_layout">
                <div className="contact_info">
                    <div className="contact_info_item">
                        <p className="contact_info_label">EMAIL</p>
                        <p className="contact_info_value">contact@greenroots.fr</p>
                    </div>
                    <div className="contact_info_item">
                        <p className="contact_info_label">LOCALISATION</p>
                        <p className="contact_info_value">Bordeaux, France</p>
                    </div>
                    <div className="contact_info_item">
                        <p className="contact_info_label">HORAIRES</p>
                        <p className="contact_info_value">Lundi – Vendredi, 9h – 18h</p>
                    </div>
                </div>

                <form className="contact_form" aria-label="Formulaire de contact">
                    <div className="contact_form_row">
                        <div className="contact_field">
                            <label className="contact_label" htmlFor="contact-lastname">Nom</label>
                            <input id="contact-lastname" type="text" className="contact_input" placeholder="Votre nom" autoComplete="family-name" />
                        </div>
                        <div className="contact_field">
                            <label className="contact_label" htmlFor="contact-firstname">Prénom</label>
                            <input id="contact-firstname" type="text" className="contact_input" placeholder="Votre prénom" autoComplete="given-name" />
                        </div>
                    </div>
                    <div className="contact_field">
                        <label className="contact_label" htmlFor="contact-email">Email</label>
                        <input id="contact-email" type="email" className="contact_input" placeholder="votre@email.fr" autoComplete="email" />
                    </div>
                    <div className="contact_field">
                        <label className="contact_label" htmlFor="contact-subject">Sujet</label>
                        <input id="contact-subject" type="text" className="contact_input" placeholder="Sujet de votre message" />
                    </div>
                    <div className="contact_field">
                        <label className="contact_label" htmlFor="contact-message">Message</label>
                        <textarea id="contact-message" className="contact_textarea" placeholder="Votre message..." rows={6} />
                    </div>
                    <button type="submit" className="contact_btn">Envoyer le message</button>
                </form>
            </div>
        </main>
    )
}

export default Contact