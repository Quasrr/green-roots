import { createContext, useContext, useEffect, useState } from 'react';
import type { CartContextType, RedisCartItem, Tree } from '../types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<RedisCartItem[]>([]);
    const { isLoading, isLoggedIn } = useAuth();

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Charge le panier depuis Redis
    async function loadCart() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setItems(Array.isArray(data.items) ? data.items : []);
            }
        } catch {
            toast.error('Impossible de charger le panier');
        };
    };

    useEffect(() => {
        if (isLoading) return;

        if (!isLoggedIn) {
            setItems([]);
            return;
        };

        loadCart();
    }, [isLoading, isLoggedIn]);

    // Synchronise une modification de panier et re-aligne l'état local sur la réponse serveur
    async function sendToBack(id: number, quantity: number) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': localStorage.getItem('csrfToken') || ''
            },
            body: JSON.stringify({ item: { id, quantity } }),
        });

        const data = await response.json();

        if (!response.ok) {
            toast.error('Mise à jour du panier échouée');
        };

        return Array.isArray(data.items) ? data.items : [];
    };

    async function syncCartChange(id: number, quantity: number) {
        try {
            const serverItems = await sendToBack(id, quantity);

            setItems(serverItems);
        } catch {
            toast.error('Mise à jour du panier échouée');

            await loadCart();
        };
    };

    async function syncCartClear(items: RedisCartItem[]) {
        try {
            for (const item of items) {
                await sendToBack(item.id, 0);
            };

        } catch {
            toast.error('Mise à jour du panier échouée');

            await loadCart();
        };
    };

    function addToCart(tree: Tree) {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === tree.id);

            if (existing) {
                return prev.map((item) =>
                    item.id === tree.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            };

            return [
                ...prev,
                {
                    id: tree.id,
                    title: tree.name,
                    image: tree.image,
                    price: tree.price,
                    inStock: tree.quantity > 0,
                    quantity: 1,
                    label: tree.label
                }
            ];
        });

        syncCartChange(tree.id, 1); // quantity = 1 = incrément
    };

    function removeFromCart(treeId: number) {
        setItems((prev) => prev.filter((item) => item.id !== treeId));

        syncCartChange(treeId, 0); // quantity = 0 = suppression
    };

    function updateQuantity(treeId: number, quantity: number) {
        if (quantity <= 0) {
            removeFromCart(treeId);
            return;
        };

        const existing = items.find((item) => item.id === treeId);
        if (!existing) return;

        const delta = quantity - existing.quantity; // différence entre nouvelle et ancienne quantité
        syncCartChange(treeId, delta);

        setItems((prev) => {
            return prev.map((item) => (item.id === treeId ? { ...item, quantity } : item));
        });
    };

    function clearCart() {
        setItems([]);

        syncCartClear(items);
    };

    return (
        <CartContext.Provider value={{ items, totalItems, addToCart, removeFromCart, updateQuantity, clearCart, setItems, loadCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
};