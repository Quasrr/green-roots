import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Users, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import type { AdminUser, Order, Tab } from '../types';
import '../components/styles/AdminDashboard.css';

function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<Tab>('users');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Pour déplier/replier le détail d'une commande
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    // Rediriger si pas admin
    useEffect(() => {
        if (user && user.role !== 1) {
            navigate('/');
        }
    }, [user, navigate]);

    // Charger les données quand l'onglet change
    useEffect(() => {
        if (!user || user.role !== 1) return;

        async function fetchData() {
            setLoading(true);
            setError('');
            try {
                const endpoint = activeTab === 'users' ? '/api/users' : '/api/orders';
                const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                    credentials: 'include',
                });

                if (!res.ok) throw new Error('Erreur lors du chargement des données');

                const data = await res.json();
                if (activeTab === 'users') {
                    setUsers(data);
                } else {
                    setOrders(data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [activeTab, user]);

    // Si pas connecté ou pas admin, on n'affiche rien
    if (!user || user.role !== 1) return null;

    function toggleOrder(orderId: number) {
        setExpandedOrder(prev => prev === orderId ? null : orderId);
    }

    return (
        <main className="admin_wrapper">
            <h1>Dashboard Admin</h1>
            <p className="admin_description">Gérez les utilisateurs et les commandes de la plateforme.</p>

            {/* Onglets */}
            <div className="admin_tabs">
                <button
                    className={`admin_tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} />
                    Utilisateurs ({users.length})
                </button>
                <button
                    className={`admin_tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <ShoppingBag size={18} />
                    Commandes ({orders.length})
                </button>
            </div>

            {/* Contenu */}
            {error && <p className="admin_error">{error}</p>}

            {loading ? (
                <p className="admin_loading">Chargement...</p>
            ) : activeTab === 'users' ? (
                /* ===== TABLE UTILISATEURS ===== */
                <div className="admin_table_wrapper">
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Adresse</th>
                                <th>Rôle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.firstname} {u.lastname}</td>
                                    <td>{u.email}</td>
                                    <td>{u.address || '—'}</td>
                                    <td>
                                        <span className={`admin_role_badge ${u.role.nameRole === 'admin' ? 'admin' : ''}`}>
                                            {u.role.nameRole === 'admin' ? 'Admin' : 'Membre'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <p className="admin_empty">Aucun utilisateur trouvé.</p>}
                </div>
            ) : (
                /* ===== TABLE COMMANDES ===== */
                <div className="admin_table_wrapper">
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Client</th>
                                <th>Email</th>
                                <th>Total</th>
                                <th>Statut</th>
                                <th>Détails</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <>
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.user.firstname} {order.user.lastname}</td>
                                        <td>{order.user.email}</td>
                                        <td className="admin_price">{Number(order.total).toFixed(2)} €</td>
                                        <td>
                                            <span className={`admin_status_badge ${order.status}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="admin_expand_btn"
                                                onClick={() => toggleOrder(order.id)}
                                            >
                                                {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedOrder === order.id && (
                                        <tr key={`detail-${order.id}`} className="admin_order_detail_row">
                                            <td colSpan={6}>
                                                <div className="admin_order_detail">
                                                    <h4>Articles de la commande #{order.id}</h4>
                                                    <ul>
                                                        {order.lines.map(line => (
                                                            <li key={line.id}>
                                                                <span className="admin_line_name">{line.tree.name}</span>
                                                                <span className="admin_line_qty">x{line.quantity}</span>
                                                                <span className="admin_line_price">{(Number(line.tree.price) * line.quantity).toFixed(2)} €</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && <p className="admin_empty">Aucune commande trouvée.</p>}
                </div>
            )}
        </main>
    );
}

export default AdminDashboard;
