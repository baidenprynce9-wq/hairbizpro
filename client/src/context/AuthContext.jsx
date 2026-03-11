import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(() => {
        const stored = localStorage.getItem('hairbiz_admin');
        return stored ? JSON.parse(stored) : null;
    });

    const login = (adminData, token) => {
        localStorage.setItem('hairbiz_token', token);
        localStorage.setItem('hairbiz_admin', JSON.stringify(adminData));
        setAdmin(adminData);
    };

    const logout = () => {
        localStorage.removeItem('hairbiz_token');
        localStorage.removeItem('hairbiz_admin');
        setAdmin(null);
    };

    const isAuthenticated = !!admin;

    return (
        <AuthContext.Provider value={{ admin, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
