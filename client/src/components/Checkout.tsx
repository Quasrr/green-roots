import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import './styles/Checkout.css';

function Checkout() {
    const { isLoggedIn } = useAuth();
    const { items, clearCart } = useCart();
    const navigate = useNavigate();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [form, setForm] = useState({
        email: '',
        address: '',
        zipCode: '',
        city: '',
        supplement: '',
        cardNumber: '',
        expiration: '',
        cvv: '',
    });

    // Vérification de connexion pour être sur la page paiement, sinon redirection
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
            return;
        }
    }, [isLoggedIn, navigate]);

    // Si le panier est vide, on redirige vers le catalogue
    if (items.length === 0) {
        return (
            <main className="checkout_wrapper">
                <div className="checkout_empty">
                    <p>Votre panier est vide.</p>
                    <Link to="/catalog" className="checkout_empty_link">Découvrir le catalogue</Link>
                </div>
            </main>
        );
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        // Simule un traitement de paiement de 2,5 secondes
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);

            // Après 2 secondes sur l'écran "Paiement accepté", on vide le panier et on redirige
            setTimeout(() => {
                clearCart();
                navigate('/');
            }, 2000);
        }, 2500);
    }

    return (
        <main className="checkout_wrapper">
            <div className="checkout_layout">

                {/* === Colonne gauche : résumé des articles === */}
                <div className="checkout_left">
                    <div className="checkout_items">
                        {items.map((item, index) => (
                            <div key={item.id}>
                                <div className="checkout_item">
                                    <img
                                        src={`/${item.image}`}
                                        alt={item.title}
                                        className="checkout_item_img"
                                    />
                                    <div className="checkout_item_info">
                                        <p className="checkout_item_name">{item.title}</p>
                                        <p className="checkout_item_label">{item.label}</p>
                                    </div>
                                    <p className="checkout_item_price">
                                        {(item.price * item.quantity).toFixed(2)}€
                                    </p>
                                </div>
                                {/* Séparateur entre les articles (pas après le dernier) */}
                                {index < items.length - 1 && <hr className="checkout_divider" />}
                            </div>
                        ))}
                    </div>

                    {/* Boîte sous-total */}
                    <div className="checkout_subtotal_box">
                        <p className="checkout_subtotal_label">
                            Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})
                        </p>
                        <p className="checkout_subtotal_amount">{subtotal.toFixed(2)} €</p>
                    </div>
                </div>

                {/* === Colonne droite : formulaire de paiement === */}
                <div className="checkout_right">
                    <h2 className="checkout_form_title">Informations de paiement</h2>

                    <form className="checkout_form" onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="checkout_field">
                            <label className="checkout_label" htmlFor="email">
                                Email de facturation
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="checkout_input"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Adresse + Code postal */}
                        <div className="checkout_row">
                            <div className="checkout_field">
                                <label className="checkout_label" htmlFor="address">
                                    Adresse de facturation
                                </label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    className="checkout_input"
                                    placeholder="1 avenue d'Oclock"
                                    value={form.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="checkout_field">
                                <label className="checkout_label" htmlFor="zipCode">
                                    Code postal
                                </label>
                                <input
                                    id="zipCode"
                                    name="zipCode"
                                    type="text"
                                    className="checkout_input"
                                    placeholder="95000"
                                    value={form.zipCode}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Ville + Supplément */}
                        <div className="checkout_row">
                            <div className="checkout_field">
                                <label className="checkout_label" htmlFor="city">
                                    Ville
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    className="checkout_input"
                                    placeholder="Paris"
                                    value={form.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="checkout_field">
                                <label className="checkout_label" htmlFor="supplement">
                                    Supplément
                                </label>
                                <input
                                    id="supplement"
                                    name="supplement"
                                    type="text"
                                    className="checkout_input"
                                    placeholder="Bât - Rce"
                                    value={form.supplement}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Section carte bancaire */}
                        <h3 className="checkout_card_title">Carte bancaire</h3>

                        {/* Numéro de carte + Expiration */}
                        <div className="checkout_row">
                            <div className="checkout_field">
                                <label className="checkout_label" htmlFor="cardNumber">
                                    Numéro de carte
                                </label>
                                <input
                                    id="cardNumber"
                                    name="cardNumber"
                                    type="text"
                                    className="checkout_input"
                                    placeholder="1234 4567 8910 1234"
                                    value={form.cardNumber}
                                    onChange={handleChange}
                                    maxLength={19}
                                    required
                                />
                            </div>
                            <div className="checkout_field">
                                <label className="checkout_label" htmlFor="expiration">
                                    Expiration
                                </label>
                                <input
                                    id="expiration"
                                    name="expiration"
                                    type="text"
                                    className="checkout_input"
                                    placeholder="01/01"
                                    value={form.expiration}
                                    onChange={handleChange}
                                    maxLength={5}
                                    required
                                />
                            </div>
                        </div>

                        {/* Code de sécurité */}
                        <div className="checkout_field">
                            <label className="checkout_label" htmlFor="cvv">
                                Code de sécurité
                            </label>
                            <input
                                id="cvv"
                                name="cvv"
                                type="text"
                                className="checkout_input"
                                placeholder="123"
                                value={form.cvv}
                                onChange={handleChange}
                                maxLength={4}
                                required
                            />
                        </div>

                        <button type="submit" className="checkout_pay_btn">
                            Payer
                        </button>
                    </form>
                </div>

            </div>

            {/* === Overlay loader / succès === */}
            {(isLoading || isSuccess) && (
                <div className="checkout_overlay">
                    {isLoading && (
                        <div className="checkout_loader_box">
                            <div className="checkout_spinner" />
                            <p className="checkout_loader_text">Traitement du paiement…</p>
                        </div>
                    )}
                    {isSuccess && (
                        <div className="checkout_success_box">
                            <div className="checkout_success_icon">✓</div>
                            <p className="checkout_success_title">Paiement accepté !</p>
                            <p className="checkout_success_sub">Merci pour votre commande.</p>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

export default Checkout;
