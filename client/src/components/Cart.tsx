import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import '../components/styles/Cart.css';
import { useEffect } from 'react';

function Cart() {
    const { isLoggedIn, isLoading } = useAuth();
    const { items, removeFromCart, updateQuantity, setItems } = useCart();
    const navigate = useNavigate();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Vérification de connexion pour être sur la page panier, sinon redirection
    useEffect(() => {
        if (isLoading) return;
        if (!isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, isLoading, navigate]);

    useEffect(() => {
        if (isLoading || !isLoggedIn) return;

        async function loadCart() {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setItems(Array.isArray(data.items) ? data.items : []);
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadCart();
    }, [isLoggedIn, isLoading, setItems]);

    if (items.length === 0) {
        return (
            <main className="cart_wrapper">
                <h1>Mon Panier</h1>
                <div className="cart_empty">
                    <p>Votre panier est vide.</p>
                    <Link to="/catalog" className="cart_empty_link">Découvrir le catalogue</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="cart_wrapper">
            <h1>Mon Panier</h1>
            <p className="cart_description">{items.length} article{items.length > 1 ? 's' : ''} dans votre panier</p>

            <div className="cart_layout">
                {/* Liste des articles */}
                <div className="cart_items">
                    {items.map(item => (
                        <div className="cart_item" key={item.id}>
                            <img
                                src={`/${item.image}`}
                                alt={item.title}
                                className="cart_item_img"
                            />
                            <div className="cart_item_info">
                                <p className="cart_item_name">{item.title}</p>
                                <p className="cart_item_label">{item.label}</p>
                                <p className="cart_item_price">{item.price}€ / unité</p>
                            </div>
                            <div className="cart_item_controls">
                                <button
                                    className="cart_qty_btn"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="cart_qty">{item.quantity}</span>
                                <button
                                    className="cart_qty_btn"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <p className="cart_item_subtotal">{(item.price * item.quantity).toFixed(2)}€</p>
                            <button
                                className="cart_remove_btn"
                                onClick={() => removeFromCart(item.id)}
                                aria-label="Supprimer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Résumé commande */}
                <aside className="cart_summary">
                    <h4>Résumé de la commande</h4>
                    <div className="cart_summary_row">
                        <span>Sous-total</span>
                        <span>{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="cart_summary_total">
                        <span>Total</span>
                        <span>{subtotal.toFixed(2)}€</span>
                    </div>
                    <button className="cart_order_btn" onClick={() => navigate('/checkout')}>Commander</button>
                </aside>
            </div>
        </main>
    );
}

export default Cart;
