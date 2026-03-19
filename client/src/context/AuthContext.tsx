import { createContext, useContext, useEffect, useState } from 'react';

// Type de l'utilisateur connecté 
type User = {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    role: number; // 1 = admin, 2 = user
};

// Ce qu'on expose à tous les composants 
type AuthContextType = {
    user: User | null;       // null = pas connecté
    isLoggedIn: boolean;
    isLoading: boolean;      // true pendant qu'on vérifie le cookie au démarrage
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

//Provider : enveloppe l'app et fournit l'état auth à tous les composants qui en ont besoin
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); 

    // Au démarrage de l'app, on vérifie si un cookie valide existe déjà
    // Si oui → l'utilisateur reste connecté même après un refresh de page
    useEffect(() => {
        async function checkAuth() {
            try {
                // credentials: 'include' est OBLIGATOIRE pour envoyer les cookies
                const res = await fetch('http://localhost:3000/api/auth/me', {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data); // cookie valide → on stocke l'utilisateur
                } else {
                    setUser(null); // cookie expiré ou absent → pas connecté
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false); // vérification terminée dans tous les cas
            }
        }
        checkAuth();
    }, []);

    // Connexion : appelle POST /api/auth/login puis récupère les infos user
    async function login(email: string, password: string) {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // reçoit et stocke le cookie httpOnly
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Email ou mot de passe incorrect');
        }

        // Le cookie est maintenant dans le navigateur
        // On appelle /me pour récupérer les vraies infos de l'utilisateur
        const meRes = await fetch('http://localhost:3000/api/auth/me', {
            credentials: 'include',
        });
        const userData = await meRes.json();
        setUser(userData);
    }

    // Déconnexion : appelle POST /api/auth/logout qui supprime le cookie côté serveur
    async function logout() {
        await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null); // on vide l'état local
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn: user !== null,
            isLoading,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook pour utiliser l'auth facilement dans n'importe quel composant
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return context;
}
