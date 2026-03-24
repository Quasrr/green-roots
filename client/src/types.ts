export type Category = {
    id: number
    name: string
};

export type Tree = {
    id: number
    name: string
    price: number
    description: string
    impact_co2: number
    impact_o2: number
    image: string
    quantity: number
    label: string
    country: string
    height: number
    growth: string
    exposition: string
    rusticity: string
    categories: Category[]
};

// Type de l'utilisateur connecté
export type User = {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    role: number;
};

// Type du contexte exposé aux composants
export type AuthContextType = {
    user: User | null;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

// Un article du panier = un arbre + une quantité
export type CartItem = {
    tree: Tree;
    quantity: number;
};

export type CartContextType = {
    items: CartItem[];
    totalItems: number;
    addToCart: (tree: Tree) => void;
    removeFromCart: (treeId: number) => void;
    updateQuantity: (treeId: number, quantity: number) => void;
    clearCart: () => void;
};

// Types pour le dashboard admin
export type AdminUser = {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    address: string | null;
    role: { nameRole: string };
};

export type OrderLine = {
    id: number;
    quantity: number;
    tree: {
        id: number;
        name: string;
        price: number;
    };
};

export type OrderStatus = 'waiting' | 'paid' | 'canceled';

export type Order = {
    id: number;
    status: OrderStatus;
    total: number;
    createdAt: string;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
    lines: Array<OrderLine>;
};

export type Tab = 'users' | 'orders';