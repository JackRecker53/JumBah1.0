import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext(null);

// The Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (userData) => {
        const mockUser = { id: 1, email: userData.email, name: "Sabah Explorer" };
        setUser(mockUser);
    };

    const logout = () => {
        setUser(null);
    };

    const value = { user, isAuthenticated: !!user, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// The custom hook that components will use
export const useAuth = () => {
    const context = useContext(AuthContext);
    // This check is the crucial improvement
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};