import { createContext, useContext, useEffect, useState } from 'react';

// Type de l'utilisateur connecté
type User = {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    role: number;
};

// Type du contexte exposé aux composants
type AuthContextType = {
    user: User | null;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Au montage : vérifier si une session existe déjà (cookie httpOnly)
    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        }
    }

    async function login(email: string, password: string) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Identifiants incorrects');
        }

        // Récupérer les infos user après connexion
        await checkAuth();
    }

    async function logout() {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
