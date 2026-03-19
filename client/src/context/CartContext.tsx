import { createContext, useContext, useState } from 'react';
import type { Tree } from '../types';

// === Type d'un article dans le panier ===
// Un CartItem = un arbre + la quantité choisie par l'utilisateur
export type CartItem = {
    tree: Tree;
    quantity: number;
};

// === Type du Context : ce qu'on expose aux composants ===
type CartContextType = {
    items: CartItem[];
    addToCart: (tree: Tree) => void;
    removeFromCart: (treeId: number) => void;
    updateQuantity: (treeId: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
};

// Création du context avec une valeur par défaut vide
const CartContext = createContext<CartContextType | null>(null);

// === Provider : enveloppe l'application et fournit le panier à tous les composants ===
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Ajouter un arbre au panier (ou augmenter sa quantité s'il est déjà dedans)
    function addToCart(tree: Tree) {
        setItems(prev => {
            const existing = prev.find(item => item.tree.id === tree.id);
            if (existing) {
                // L'arbre est déjà dans le panier → on incrémente la quantité
                return prev.map(item =>
                    item.tree.id === tree.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            // Nouvel arbre → on l'ajoute avec quantité 1
            return [...prev, { tree, quantity: 1 }];
        });
    }

    // Supprimer complètement un arbre du panier
    function removeFromCart(treeId: number) {
        setItems(prev => prev.filter(item => item.tree.id !== treeId));
    }

    // Modifier la quantité d'un arbre (si 0, on le supprime)
    function updateQuantity(treeId: number, quantity: number) {
        if (quantity <= 0) {
            removeFromCart(treeId);
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.tree.id === treeId ? { ...item, quantity } : item
            )
        );
    }

    // Vider tout le panier
    function clearCart() {
        setItems([]);
    }

    // Nombre total d'articles (ex: 2 chênes + 1 érable = 3)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

// Hook personnalisé pour utiliser le panier facilement dans n'importe quel composant
export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart doit être utilisé dans un CartProvider');
    return context;
}
