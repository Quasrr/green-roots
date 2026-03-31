import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import './styles/Checkout.css';

type CheckoutActionState = {
    error: string;
    orderId: number | null;
    success: boolean;
};

const genericCheckoutError = "Le paiement n'a pas pu être finalisé. Veuillez réessayer.";

const initialActionState: CheckoutActionState = {
    error: '',
    orderId: null,
    success: false,
};

function wait(duration: number) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, duration);
    });
}

function CheckoutSubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button type="submit" className="checkout_pay_btn" disabled={pending}>
            {pending ? 'Traitement...' : 'Payer'}
        </button>
    );
}

function CheckoutFeedbackOverlay({ isSuccess }: { isSuccess: boolean }) {
    const { pending } = useFormStatus();

    if (!pending && !isSuccess) {
        return null;
    }

    return (
        <div className="checkout_overlay">
            {pending && (
                <div className="checkout_loader_box">
                    <div className="checkout_spinner" />
                    <p className="checkout_loader_text">Traitement de la commande...</p>
                </div>
            )}
            {isSuccess && !pending && (
                <div className="checkout_success_box">
                    <div className="checkout_success_icon">✓</div>
                    <p className="checkout_success_title">Commande effectuée !</p>
                    <p className="checkout_success_sub">Merci pour votre commande.</p>
                </div>
            )}
        </div>
    );
}

export default function Checkout() {
    const { isLoggedIn } = useAuth();
    const { items, clearCart } = useCart();
    const navigate = useNavigate();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const [actionState, submitOrder] = useActionState(async (_previousState: CheckoutActionState, formData: FormData) => {
        const email = String(formData.get('email') || '').trim();
        const address = String(formData.get('address') || '').trim();
        const zipCode = String(formData.get('zipCode') || '').trim();
        const city = String(formData.get('city') || '').trim();
        const cardNumber = String(formData.get('cardNumber') || '').trim();
        const expiration = String(formData.get('expiration') || '').trim();
        const cvv = String(formData.get('cvv') || '').trim();

        if (!email || !address || !zipCode || !city || !cardNumber || !expiration || !cvv) {
            return {
                error: 'Le formulaire de paiement est incomplet.',
                orderId: null,
                success: false,
            };
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': localStorage.getItem('csrfToken') || '',
            },
            body: JSON.stringify(
                items.map((item) => ({
                    treeId: item.id,
                    quantity: item.quantity,
                }))
            ),
        });

        if (!response.ok) {
            toast.error(genericCheckoutError)
            return {
                error:'',
                orderId: null,
                success: false
            };
        }
        
        const data = await response.json();

        await wait(2500);

        return {
            error: '',
            orderId: data.id,
            success: true,
        };
    }, initialActionState);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        if (!actionState.success || !actionState.orderId) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            window.sessionStorage.setItem('pendingPaymentOrderId', String(actionState.orderId));
            clearCart();
            navigate('/account/orders');
        }, 2000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [actionState.orderId, actionState.success, clearCart, navigate]);

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

    return (
        <main className="checkout_wrapper">
            <div className="checkout_layout">
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
                                {index < items.length - 1 && <hr className="checkout_divider" />}
                            </div>
                        ))}
                    </div>

                    <div className="checkout_subtotal_box">
                        <p className="checkout_subtotal_label">
                            Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})
                        </p>
                        <p className="checkout_subtotal_amount">{subtotal.toFixed(2)} €</p>
                    </div>
                </div>

                <div className="checkout_right">
                    <h2 className="checkout_form_title">Informations de paiement</h2>

                    <form className="checkout_form" action={submitOrder} aria-label="Formulaire de paiement">
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
                                required
                            />
                        </div>

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
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="Bat - Rce"
                                />
                            </div>
                        </div>

                        <h3 className="checkout_card_title">Carte bancaire</h3>

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
                                    maxLength={5}
                                    required
                                />
                            </div>
                        </div>

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
                                maxLength={4}
                                required
                            />
                        </div>

                        {actionState.error && <p className="checkout_error">{actionState.error}</p>}

                        <CheckoutSubmitButton />
                        <CheckoutFeedbackOverlay isSuccess={actionState.success} />
                    </form>
                </div>
            </div>
        </main>
    );
}
