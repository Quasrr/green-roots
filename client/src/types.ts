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