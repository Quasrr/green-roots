import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

function Cart() {
    const { items, removeFromCart, updateQuantity, clearCart } = useCart();

    // Calcul du sous-total
    const subtotal = items.reduce((sum, item) => sum + item.tree.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 15 : 0;
    const total = subtotal + shipping;

    // === Panier vide ===
    if (items.length === 0) {
        return (
            <main className="cart_wrapper">
                <h1>Mon Panier</h1>
                <div className="cart_empty">
                    <div className="cart_empty_icon">
                        <ShoppingCart size={48} color="#6F777A" />
                    </div>
                    <p className="cart_empty_title">Votre panier est vide</p>
                    <p className="cart_empty_description">Découvrez notre sélection d'arbres exceptionnels et ajoutez-en à votre panier.</p>
                    <Link to="/catalog" className="cart_btn_catalog">Voir le catalogue</Link>
                </div>
            </main>
        );
    }

    // === Panier avec articles ===
    return (
        <main className="cart_wrapper">
            <div className="cart_header_row">
                <h1>Mon Panier</h1>
                <button className="cart_btn_clear" onClick={clearCart}>Vider le panier</button>
            </div>

            <div className="cart_layout">

                {/* Liste des articles */}
                <section className="cart_items">
                    {items.map(({ tree, quantity }) => (
                        <article className="cart_item" key={tree.id}>
                            <img src={`/${tree.image}`} alt={tree.name} className="cart_item_img" />

                            <div className="cart_item_info">
                                <div className="cart_item_top">
                                    <div>
                                        <p className="cart_item_name">{tree.name}</p>
                                        <p className="cart_item_label">{tree.label}</p>
                                    </div>
                                    <button
                                        className="cart_item_remove"
                                        onClick={() => removeFromCart(tree.id)}
                                        aria-label="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="cart_item_bottom">
                                    {/* Contrôles de quantité */}
                                    <div className="cart_quantity">
                                        <button
                                            className="cart_qty_btn"
                                            onClick={() => updateQuantity(tree.id, quantity - 1)}
                                            aria-label="Diminuer"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="cart_qty_value">{quantity}</span>
                                        <button
                                            className="cart_qty_btn"
                                            onClick={() => updateQuantity(tree.id, quantity + 1)}
                                            aria-label="Augmenter"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <p className="cart_item_price">{(tree.price * quantity).toFixed(2)}€</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                {/* Résumé de commande */}
                <aside className="cart_summary">
                    <p className="cart_summary_title">Résumé de commande</p>

                    <div className="cart_summary_row">
                        <span>Sous-total</span>
                        <span>{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="cart_summary_row">
                        <span>Livraison</span>
                        <span>{shipping === 0 ? 'Gratuit' : `${shipping}€`}</span>
                    </div>

                    <div className="cart_summary_divider" />

                    <div className="cart_summary_row cart_summary_total">
                        <span>Total</span>
                        <span>{total.toFixed(2)}€</span>
                    </div>

                    <button className="cart_btn_order">Passer la commande</button>
                    <Link to="/catalog" className="cart_link_continue">Continuer mes achats</Link>
                </aside>
            </div>
        </main>
    );
}

export default Cart;
