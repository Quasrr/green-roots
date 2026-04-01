import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LoaderCircle, PackageSearch, Receipt, Sprout, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import type { Order, OrderStatus } from '../types.ts';
import './styles/Orders.css';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

const statusLabels: Record<OrderStatus, string> = {
    waiting: 'En attente',
    paid: 'Payée',
    canceled: 'Annulée',
};

function formatCurrency(value: number | string) {
    return currencyFormatter.format(Number(value));
};

function formatOrderDate(value: string) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
};

function getStatusClassName(status: OrderStatus) {
    return `orders_status_badge orders_status_badge_${status}`;
};

export default function Orders() {
    const { user, isLoggedIn, isLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Array<Order>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshIndex, setRefreshIndex] = useState(0);
    const [cancelingId, setCancelingId] = useState<number | null>(null);
    // ID de la commande pour laquelle on affiche la modale de confirmation
    const [cancelModalOrderId, setCancelModalOrderId] = useState<number | null>(null);
    const paymentRequestStarted = useRef(false);

    useEffect(() => {
        // Un utilisateur non connecté est redirigé sur la page d'accueil
        if (isLoading) return;
        if (!isLoggedIn) {
            navigate('/');
            return;
        };

        let isCancelled = false;

        async function loadOrders() {
            setLoading(true);
            setError('');

            try {
                // Charge uniquement l'historique du compte courant
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/me`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('LOAD_ORDERS_FAILED');
                };

                const data: Array<Order> = await response.json();

                if (!isCancelled) {
                    setOrders(data);
                };
            } catch (err) {
                if (!isCancelled) {
                    setError('Impossible de charger vos commandes pour le moment');
                };
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                };
            };
        };

        loadOrders();

        return () => {
            isCancelled = true;
        };
    }, [isLoggedIn, navigate, refreshIndex]);

    useEffect(() => {
        if (isLoading || !isLoggedIn) {
            return;
        }

        const pendingPaymentOrderId = window.sessionStorage.getItem('pendingPaymentOrderId');

        if (!pendingPaymentOrderId || paymentRequestStarted.current) {
            return;
        }

        paymentRequestStarted.current = true;

        const timeoutId = window.setTimeout(async () => {
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${pendingPaymentOrderId}/pay`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-csrf-token': localStorage.getItem('csrfToken') || '',
                    },
                });
            } finally {
                window.sessionStorage.removeItem('pendingPaymentOrderId');
                setRefreshIndex((current) => current + 1);
            }
        }, 1500);

        return () => {
            window.clearTimeout(timeoutId);
            paymentRequestStarted.current = false;
        };
    }, [isLoading, isLoggedIn]);

    // Initiales de l'user (firstname lastname)
    const initials = `${user?.firstname?.charAt(0)}${user?.lastname?.charAt(0)}`.toUpperCase();
    const totalOrders = orders.length;

    // Total d'abres achetés
    const totalTrees = orders.reduce((sum, order) => sum + order.lines.reduce((lineSum, line) => lineSum + line.quantity, 0), 0);
    // Total d'euros dépensés
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);

    // Ouvre la modale de confirmation d'annulation
    function openCancelModal(orderId: number) {
        setCancelModalOrderId(orderId);
    }

    // Ferme la modale sans annuler
    function closeCancelModal() {
        setCancelModalOrderId(null);
    }

    // Confirme l'annulation depuis la modale
    async function confirmCancelOrder() {
        if (!cancelModalOrderId) return;

        setCancelingId(cancelModalOrderId);
        closeCancelModal();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${cancelModalOrderId}/cancel`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': localStorage.getItem('csrfToken') || '',
                },
            });

            if (!response.ok) {
                throw new Error('CANCEL_ORDER_FAILED');
            }

            // Rafraîchit la liste après annulation
            setRefreshIndex((current) => current + 1);
        } catch (err) {
            setError('Impossible d\'annuler cette commande pour le moment');
        } finally {
            setCancelingId(null);
        }
    }

    return (
        <main className="orders_wrapper">
            <div className="orders_intro">
                <h1>Historique de commandes</h1>
                <p className="orders_description">
                    Retrouvez le détail de vos commandes validées et le total des arbres commandés sur GreenRoots.
                </p>
            </div>

            <div className="orders_layout">
                <aside className="orders_summary_card">
                    <div className="orders_avatar">{initials}</div>
                    <p className="orders_summary_name">
                        {user ? `${user.firstname} ${user.lastname}` : 'Votre espace GreenRoots'}
                    </p>
                    <p className="orders_summary_email">
                        {user?.email || 'Connectez-vous pour retrouver vos achats et leurs details.'}
                    </p>

                    <div className="orders_summary_metrics">
                        <div className="orders_summary_metric">
                            <span className="orders_summary_metric_value">{totalOrders}</span>
                            <span className="orders_summary_metric_label">commande{totalOrders > 1 ? 's' : ''}</span>
                        </div>
                        <div className="orders_summary_metric">
                            <span className="orders_summary_metric_value">{totalTrees}</span>
                            <span className="orders_summary_metric_label">arbre{totalTrees > 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    <Link to="/account" className="orders_back_link">
                        <ArrowLeft size={16} />
                        <span>Retour à mon compte</span>
                    </Link>
                </aside>

                <section className="orders_content">
                    <div className="orders_stats_grid">
                        <article className="orders_stat_card">
                            <div className="orders_stat_icon">
                                <Receipt size={18} />
                            </div>
                            <div>
                                <p className="orders_stat_value">{totalOrders}</p>
                                <p className="orders_stat_label">Commandes passées</p>
                            </div>
                        </article>

                        <article className="orders_stat_card">
                            <div className="orders_stat_icon">
                                <Sprout size={18} />
                            </div>
                            <div>
                                <p className="orders_stat_value">{totalTrees}</p>
                                <p className="orders_stat_label">Arbres commandés</p>
                            </div>
                        </article>

                        <article className="orders_stat_card">
                            <div className="orders_stat_icon">
                                <Receipt size={18} />
                            </div>
                            <div>
                                <p className="orders_stat_value">{formatCurrency(totalSpent)}</p>
                                <p className="orders_stat_label">Montant cumulé</p>
                            </div>
                        </article>
                    </div>

                    {loading && (
                        <div className="orders_state_card">
                            <LoaderCircle className="orders_state_spinner" size={24} />
                            <p>Chargement de vos commandes...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="orders_state_card">
                            <PackageSearch size={30} />
                            <h2>Impossible de charger vos commandes</h2>
                            <p>{error}</p>
                            <button
                                type="button"
                                className="orders_primary_action orders_primary_action_button"
                                onClick={() => setRefreshIndex((current) => current + 1)}
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {!loading && !error && orders.length === 0 && (
                        <div className="orders_state_card">
                            <PackageSearch size={30} />
                            <h2>Aucune commande pour le moment</h2>
                            <p>Votre historique apparaîtra ici dès votre premiere commande validée.</p>
                            <div className="orders_state_actions">
                                <Link to="/catalog" className="orders_primary_action">Explorer le catalogue</Link>
                            </div>
                        </div>
                    )}

                    {!loading && !error && orders.length > 0 && (
                        <div className="orders_list">
                            {orders.map((order, index) => {
                                const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);
                                const orderNumber = totalOrders - index;

                                return (
                                    <article key={order.id} className="orders_card">
                                        <div className="orders_card_header">
                                            <div>
                                                <p className="orders_card_eyebrow">Commande #{orderNumber}</p>
                                                <h2 className="orders_card_title">
                                                    {itemCount} article{itemCount > 1 ? 's' : ''} dans cette commande
                                                </h2>
                                            </div>
                                            <span className={getStatusClassName(order.status)}>
                                                {statusLabels[order.status]}
                                            </span>
                                        </div>

                                        <div className="orders_card_resume">
                                            <p>
                                                Date de commande
                                                <strong>{formatOrderDate(order.createdAt)}</strong>
                                            </p>
                                            <p>
                                                Total de la commande
                                                <strong>{formatCurrency(order.total)}</strong>
                                            </p>
                                            <p>
                                                Référence
                                                <strong>GR-{String(order.id).padStart(4, '0')}</strong>
                                            </p>
                                        </div>

                                        <div className="orders_lines">
                                            {order.lines.map((line) => {
                                                const unitPrice = Number(line.tree.price);
                                                const lineTotal = unitPrice * line.quantity;

                                                return (
                                                    <div key={line.id} className="orders_line">
                                                        <div className="orders_line_icon">
                                                            <Sprout size={18} />
                                                        </div>

                                                        <div className="orders_line_content">
                                                            <p className="orders_line_name">{line.tree.name}</p>
                                                            <p className="orders_line_meta">
                                                                {formatCurrency(unitPrice)} / unité
                                                            </p>
                                                        </div>

                                                        <p className="orders_line_quantity">x{line.quantity}</p>
                                                        <p className="orders_line_total">{formatCurrency(lineTotal)}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {(order.status === 'waiting' || order.status === 'paid') && (
                                            <div className="orders_card_actions">
                                                <button
                                                    type="button"
                                                    className="orders_cancel_button"
                                                    onClick={() => openCancelModal(order.id)}
                                                    disabled={cancelingId === order.id}
                                                >
                                                    {cancelingId === order.id ? 'Annulation...' : 'Annuler la commande'}
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* Modale de confirmation d'annulation */}
            {cancelModalOrderId !== null && (
                <div className="orders_modal_overlay" onClick={closeCancelModal}>
                    <div className="orders_modal" onClick={e => e.stopPropagation()}>
                        <div className="orders_modal_header">
                            <h2>Annuler la commande</h2>
                            <button className="orders_modal_close" onClick={closeCancelModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="orders_modal_body">
                            <p>Êtes-vous sûr de vouloir annuler cette commande ?</p>
                            <p className="orders_modal_hint">Cette action est irréversible.</p>
                        </div>
                        <div className="orders_modal_footer">
                            <button className="orders_modal_btn cancel" onClick={closeCancelModal}>
                                Garder ma commande
                            </button>
                            <button className="orders_modal_btn confirm" onClick={confirmCancelOrder}>
                                Confirmer l'annulation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
