import { createContext, useContext, useState } from 'react';
import type { Tree } from '../types';

// Un article du panier = un arbre + une quantité
type CartItem = {
    tree: Tree;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    totalItems: number;
    addToCart: (tree: Tree) => void;
    removeFromCart: (treeId: number) => void;
    updateQuantity: (treeId: number, quantity: number) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    function addToCart(tree: Tree) {
        setItems(prev => {
            const existing = prev.find(i => i.tree.id === tree.id);
            if (existing) {
                // L'arbre est déjà dans le panier → on augmente la quantité
                return prev.map(i =>
                    i.tree.id === tree.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            // Nouvel arbre → on l'ajoute
            return [...prev, { tree, quantity: 1 }];
        });
    }

    function removeFromCart(treeId: number) {
        setItems(prev => prev.filter(i => i.tree.id !== treeId));
    }

    function updateQuantity(treeId: number, quantity: number) {
        if (quantity <= 0) {
            removeFromCart(treeId);
            return;
        }
        setItems(prev =>
            prev.map(i => i.tree.id === treeId ? { ...i, quantity } : i)
        );
    }

    function clearCart() {
        setItems([]);
    }

    return (
        <CartContext.Provider value={{ items, totalItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
}
