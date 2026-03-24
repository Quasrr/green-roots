import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LoaderCircle, PackageSearch, Receipt, Sprout } from 'lucide-react';
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
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Array<Order>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
        // Un utilisateur non connecté est redirigé sur la page d'accueil
        if (!isLoggedIn) {
            navigate('/');
            return;
        };

        let isCancelled = false;

        async function loadOrders() {
            setIsLoading(true);
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
                    setIsLoading(false);
                };
            };
        };

        loadOrders();

        return () => {
            isCancelled = true;
        };
    }, [isLoggedIn, navigate, refreshIndex]);

    // Initiales de l'user (firstname lastname)
    const initials = `${user?.firstname?.charAt(0)}${user?.lastname?.charAt(0)}`.toUpperCase();
    const totalOrders = orders.length;

    // Total d'abres achetés
    const totalTrees = orders.reduce((sum, order) => sum + order.lines.reduce((lineSum, line) => lineSum + line.quantity, 0), 0);
    // Total d'euros dépensés
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);

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

                    {isLoading && (
                        <div className="orders_state_card">
                            <LoaderCircle className="orders_state_spinner" size={24} />
                            <p>Chargement de vos commandes...</p>
                        </div>
                    )}

                    {!isLoading && error && (
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

                    {!isLoading && !error && orders.length === 0 && (
                        <div className="orders_state_card">
                            <PackageSearch size={30} />
                            <h2>Aucune commande pour le moment</h2>
                            <p>Votre historique apparaîtra ici dès votre premiere commande validée.</p>
                            <div className="orders_state_actions">
                                <Link to="/catalog" className="orders_primary_action">Explorer le catalogue</Link>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && orders.length > 0 && (
                        <div className="orders_list">
                            {orders.map((order) => {
                                const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);

                                return (
                                    <article key={order.id} className="orders_card">
                                        <div className="orders_card_header">
                                            <div>
                                                <p className="orders_card_eyebrow">Commande #{order.id}</p>
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
                                    </article>
                                );
                            })};
                        </div>
                    )};
                </section>
            </div>
        </main>
    );
};