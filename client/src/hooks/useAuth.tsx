import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Au montage : vérifier si une session existe déjà (cookie httpOnly) + récupération du token csrf
    useEffect(() => {
        checkAuth();
    }, []);

    async function getCsrfToken() {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/csrf`, {
            credentials: 'include',
        });

        const data = await res.json();

        localStorage.setItem('csrfToken', data.csrfToken ?? '');
    };

    async function checkAuth() {
        try {
            await getCsrfToken();

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            };
        } catch {
            setUser(null);
        };
    };

    async function login(email: string, password: string) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': localStorage.getItem('csrfToken') || ''
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Identifiants incorrects');
        };

        await checkAuth(); // Récupérer les infos user après connexion
 // Charge le panier directement après la connexion
    };

    async function logout() {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'x-csrf-token': localStorage.getItem('csrfToken') || ''
            },
            credentials: 'include',
        });

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};