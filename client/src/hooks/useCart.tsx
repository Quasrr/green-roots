import { createContext, useEffect, useContext, useState } from 'react';
import type { CartContextType, RedisCartItem, Tree } from '../types';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<RedisCartItem[]>([]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Charger le panier depuis Redis au montage
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

// Dans le useEffect appeller loadCart() pour l'exposer au provider et l'appeler depuis AuthContext
useEffect(() => {
    loadCart();
}, []);

    async function sendToBack(id: number, quantity: number) {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': localStorage.getItem('csrfToken') || ''
                },
                body: JSON.stringify({ item: { id, quantity } }),
            });
        } catch (error) {
            console.error(error);
        }
    }

    function addToCart(tree: Tree) {
        setItems(prev => {
            const existing = prev.find(i => i.id === tree.id);
            if (existing) {
                return prev.map(i => i.id === tree.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { id: tree.id, title: tree.name, image: tree.image, price: tree.price, inStock: tree.quantity > 0, quantity: 1, label: tree.label }];
        });
        sendToBack(tree.id, 1); // quantity = 1 = incrément
    }

    function removeFromCart(treeId: number) {
        setItems(prev => prev.filter(i => i.id !== treeId));
        sendToBack(treeId, 0); // quantity = 0 = suppression
    }

    function updateQuantity(treeId: number, quantity: number) {
        if (quantity <= 0) {
            removeFromCart(treeId);
            return;
        }
        const existing = items.find(i => i.id === treeId);
        if (!existing) return;

        const delta = quantity - existing.quantity; // différence entre nouvelle et ancienne quantité
        sendToBack(treeId, delta);

        setItems(prev => {
            return prev.map(i => i.id === treeId ? { ...i, quantity } : i);
        });
    }

    function clearCart() {
        items.forEach(item => sendToBack(item.id, 0));
        setItems([]);
    }

    return (
        <CartContext.Provider value={{ items, totalItems, addToCart, removeFromCart, updateQuantity, clearCart, loadCart}}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
}