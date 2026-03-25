import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Users, ShoppingBag, TreePine, ChevronDown, ChevronUp, Pencil, Trash2, X, Plus } from 'lucide-react';
import type { AdminUser, Order, Tree, Tab } from '../types';
import '../components/styles/AdminDashboard.css';

// valeurs par défaut pour le formulaire de création
const emptyForm = {
    name: '',
    price: 0,
    description: '',
    impact_co2: 0,
    impact_o2: 0,
    image: '',
    quantity: 0,
    label: '',
    country: '',
    height: 0,
    growth: 'medium' as 'slow' | 'medium' | 'fast',
    exposition: '',
    rusticity: '',
};

function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    
    const [activeTab, setActiveTab] = useState<Tab>('users');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [trees, setTrees] = useState<Tree[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pour déplier/replier le détail d'une commande
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    // states pour la modale 
    // modalMode : 'edit' pour modifier, 'create' pour ajouter un nouvel arbre
    const [modalMode, setModalMode] = useState<'edit' | 'create'>('create');
    // isModalOpen : true = la modale est visible, false = elle est cachée
    const [isModalOpen, setIsModalOpen] = useState(false);
    // selectedTree : l'arbre qu'on modifie (utile seulement en mode 'edit')
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
    // treeForm : les valeurs du formulaire (partagé entre create et edit)
    const [treeForm, setTreeForm] = useState(emptyForm);

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
                // On choisit l'endpoint selon l'onglet actif
                let endpoint = '/api/users';
                if (activeTab === 'orders') endpoint = '/api/orders';
                if (activeTab === 'trees') endpoint = '/api/trees';

                const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                    credentials: 'include',
                });

                if (!res.ok) throw new Error('Erreur lors du chargement des données');

                const data = await res.json();

                // On range la réponse dans le bon state
                if (activeTab === 'users') setUsers(data);
                if (activeTab === 'orders') setOrders(data);
                if (activeTab === 'trees') setTrees(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [activeTab, user]);

    // Si pas connecté ou pas admin, on n'affiche rien
    if (!user || user.role !== 1) return null;

    // fonction pour déplier/replier le détail d'une commande

    function toggleOrder(orderId: number) {
        setExpandedOrder(prev => prev === orderId ? null : orderId);
    }

    // Ouvrir la modale en mode "créer" (formulaire vide)
    function openCreateModal() {
        setModalMode('create');
        setSelectedTree(null);
        setTreeForm(emptyForm); // On remet le formulaire à zéro
        setIsModalOpen(true);
    }

    // Ouvrir la modale en mode "modifier" (formulaire pré-rempli)
    function openEditModal(tree: Tree) {
        setModalMode('edit');
        setSelectedTree(tree);
        // On pré-remplit le formulaire avec les valeurs actuelles de l'arbre
        setTreeForm({
            name: tree.name,
            price: Number(tree.price),
            description: tree.description,
            impact_co2: Number(tree.impact_co2),
            impact_o2: Number(tree.impact_o2),
            image: tree.image,
            quantity: tree.quantity,
            label: tree.label,
            country: tree.country,
            height: Number(tree.height),
            growth: tree.growth as 'slow' | 'medium' | 'fast',
            exposition: tree.exposition,
            rusticity: tree.rusticity,
        });
        setIsModalOpen(true);
    }

    // Fermer la modale
    function closeModal() {
        setIsModalOpen(false);
        setSelectedTree(null);
    }

    // Mettre à jour le formulaire quand l'utilisateur tape dans un champ
    function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        // Les champs numériques sont convertis en nombre
        const numericFields = ['price', 'quantity', 'impact_co2', 'impact_o2', 'height'];
        setTreeForm(prev => ({
            ...prev,
            [name]: numericFields.includes(name) ? Number(value) : value,
        }));
    }

    // créer un arbre (POST /api/trees) 
    async function handleCreate() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': localStorage.getItem('csrfToken') || '',
                },
                credentials: 'include',
                body: JSON.stringify(treeForm),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Erreur lors de la création');
            }

            const newTree = await res.json();

            // On ajoute le nouvel arbre à la liste locale
            setTrees(prev => [...prev, newTree]);
            closeModal();
        } catch (err) {
            setError((err as Error).message);
        }
    }

    // modifier un arbre (PATCH /api/trees/:id)
    async function handleUpdate() {
        if (!selectedTree) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trees/${selectedTree.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': localStorage.getItem('csrfToken') || '',
                },
                credentials: 'include',
                body: JSON.stringify(treeForm),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Erreur lors de la modification');
            }

            const updatedTree = await res.json();

            // On met à jour la liste locale pour refléter le changement
            setTrees(prev =>
                prev.map(t => (t.id === updatedTree.id ? updatedTree : t))
            );

            closeModal();
        } catch (err) {
            setError((err as Error).message);
        }
    }

    // supprimer un arbre (DELETE /api/trees/:id)
    async function handleDelete(treeId: number) {
        // Demander confirmation avant de supprimer
        const confirmed = window.confirm('Es-tu sûr de vouloir supprimer cet arbre ?');
        if (!confirmed) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trees/${treeId}`, {
                method: 'DELETE',
                headers: {
                    'x-csrf-token': localStorage.getItem('csrfToken') || '',
                },
                credentials: 'include',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Erreur lors de la suppression');
            }

            // On retire l'arbre supprimé de la liste locale
            setTrees(prev => prev.filter(t => t.id !== treeId));
        } catch (err) {
            setError((err as Error).message);
        }
    }

    // soumission du formulaire 
    // Cette fonction appelle handleCreate ou handleUpdate selon le mode
    function handleSubmit() {
        if (modalMode === 'create') {
            handleCreate();
        } else {
            handleUpdate();
        }
    }

    return (
        <main className="admin_wrapper">
            <h1>Dashboard Admin</h1>
            <p className="admin_description">Gérez les utilisateurs, les commandes et les arbres de la plateforme.</p>

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
                <button
                    className={`admin_tab ${activeTab === 'trees' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trees')}
                >
                    <TreePine size={18} />
                    Arbres ({trees.length})
                </button>
            </div>

            {error && <p className="admin_error">{error}</p>}

            {loading ? (
                <p className="admin_loading">Chargement...</p>
            ) : activeTab === 'users' ? (
                
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
            ) : activeTab === 'orders' ? (
                
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
            ) : (
                
                <div className="admin_table_wrapper">
                    
                    <button className="admin_add_btn" onClick={openCreateModal}>
                        <Plus size={18} />
                        Ajouter un arbre
                    </button>

                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Prix</th>
                                <th>Stock</th>
                                <th>Pays</th>
                                <th>Label</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trees.map(tree => (
                                <tr key={tree.id}>
                                    <td>{tree.id}</td>
                                    <td>{tree.name}</td>
                                    <td className="admin_price">{Number(tree.price).toFixed(2)} €</td>
                                    <td>
                                        <span className={`admin_stock_badge ${tree.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                            {tree.quantity}
                                        </span>
                                    </td>
                                    <td>{tree.country}</td>
                                    <td>{tree.label}</td>
                                    <td>
                                        <div className="admin_actions">
                                            <button
                                                className="admin_action_btn edit"
                                                onClick={() => openEditModal(tree)}
                                                title="Modifier"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className="admin_action_btn delete"
                                                onClick={() => handleDelete(tree.id)}
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {trees.length === 0 && <p className="admin_empty">Aucun arbre trouvé.</p>}
                </div>
            )}

            {isModalOpen && (
                <div className="admin_modal_overlay" onClick={closeModal}>
                    {/* stopPropagation empêche la fermeture quand on clique dans la modale */}
                    <div className="admin_modal" onClick={e => e.stopPropagation()}>
                        <div className="admin_modal_header">
                            {/* Le titre change selon le mode */}
                            <h2>{modalMode === 'create' ? 'Ajouter un arbre' : "Modifier l'arbre"}</h2>
                            <button className="admin_modal_close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin_modal_body">
                            {/* Champ Nom */}
                            <label className="admin_form_label">
                                Nom
                                <input
                                    type="text"
                                    name="name"
                                    value={treeForm.name}
                                    onChange={handleFormChange}
                                    className="admin_form_input"
                                    placeholder="Ex: Chêne pédonculé"
                                />
                            </label>

                            <div className="admin_form_row">
                                <label className="admin_form_label">
                                    Prix (€)
                                    <input
                                        type="number"
                                        name="price"
                                        value={treeForm.price}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                        min={0}
                                        step={0.01}
                                    />
                                </label>
                                <label className="admin_form_label">
                                    Stock
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={treeForm.quantity}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                        min={0}
                                    />
                                </label>
                            </div>

                            <div className="admin_form_row">
                                <label className="admin_form_label">
                                    Impact CO2 (kg)
                                    <input
                                        type="number"
                                        name="impact_co2"
                                        value={treeForm.impact_co2}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                        min={0}
                                        step={0.1}
                                    />
                                </label>
                                <label className="admin_form_label">
                                    Impact O2 (kg)
                                    <input
                                        type="number"
                                        name="impact_o2"
                                        value={treeForm.impact_o2}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                        min={0}
                                        step={0.1}
                                    />
                                </label>
                            </div>

                            <label className="admin_form_label">
                                Image (URL)
                                <input
                                    type="text"
                                    name="image"
                                    value={treeForm.image}
                                    onChange={handleFormChange}
                                    className="admin_form_input"
                                    placeholder="Ex: chene.webp"
                                />
                            </label>

                            <div className="admin_form_row">
                                <label className="admin_form_label">
                                    Pays
                                    <input
                                        type="text"
                                        name="country"
                                        value={treeForm.country}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                        placeholder="Ex: France"
                                    />
                                </label>
                                <label className="admin_form_label">
                                    Label
                                    <input
                                        type="text"
                                        name="label"
                                        value={treeForm.label}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                        placeholder="Ex: Bio"
                                    />
                                </label>
                            </div>

                            <div className="admin_form_row">
                                <label className="admin_form_label">
                                    Hauteur (m)
                                    <input
                                        type="number"
                                        name="height"
                                        value={treeForm.height}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                        min={0}
                                        step={0.1}
                                    />
                                </label>
                                <label className="admin_form_label">
                                    Croissance
                                    <select
                                        name="growth"
                                        value={treeForm.growth}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                    >
                                        <option value="slow">Lente</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="fast">Rapide</option>
                                    </select>
                                </label>
                            </div>

                            <div className="admin_form_row">
                                <label className="admin_form_label">
                                    Exposition
                                    <input
                                        type="text"
                                        name="exposition"
                                        value={treeForm.exposition}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                        placeholder="Ex: Plein soleil"
                                    />
                                </label>
                                <label className="admin_form_label">
                                    Rusticité
                                    <input
                                        type="text"
                                        name="rusticity"
                                        value={treeForm.rusticity}
                                        onChange={handleFormChange}
                                        className="admin_form_input"
                                        placeholder="Ex: -15°C"
                                    />
                                </label>
                            </div>

                            <label className="admin_form_label">
                                Description
                                <textarea
                                    name="description"
                                    value={treeForm.description}
                                    onChange={handleFormChange}
                                    className="admin_form_input admin_form_textarea"
                                    rows={4}
                                    placeholder="Décrivez l'arbre..."
                                />
                            </label>
                        </div>

                        <div className="admin_modal_footer">
                            <button className="admin_btn cancel" onClick={closeModal}>
                                Annuler
                            </button>
                            <button className="admin_btn save" onClick={handleSubmit}>
                                {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminDashboard;
