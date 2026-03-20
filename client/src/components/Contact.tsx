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

                <form className="contact_form">
                    <div className="contact_form_row">
                        <div className="contact_field">
                            <label className="contact_label">Nom</label>
                            <input type="text" className="contact_input" placeholder="Votre nom" />
                        </div>
                        <div className="contact_field">
                            <label className="contact_label">Prénom</label>
                            <input type="text" className="contact_input" placeholder="Votre prénom" />
                        </div>
                    </div>
                    <div className="contact_field">
                        <label className="contact_label">Email</label>
                        <input type="email" className="contact_input" placeholder="votre@email.fr" />
                    </div>
                    <div className="contact_field">
                        <label className="contact_label">Sujet</label>
                        <input type="text" className="contact_input" placeholder="Sujet de votre message" />
                    </div>
                    <div className="contact_field">
                        <label className="contact_label">Message</label>
                        <textarea className="contact_textarea" placeholder="Votre message..." rows={6} />
                    </div>
                    <button type="submit" className="contact_btn">Envoyer le message</button>
                </form>
            </div>
        </main>
    )
}

export default Contact