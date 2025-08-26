import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (token) {
      // You might want to verify the token with the backend here
      // For simplicity, we'll just decode it (not secure for production)
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUser(decodedToken.sub);
        setIsGuest(false);
      } catch (e) {
        console.error("Invalid token", e);
        logout();
      }
    }
  }, [token]);

  const login = async (username, password) => {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      const decodedToken = JSON.parse(atob(data.access_token.split(".")[1]));
      setUser(decodedToken.sub);
      setIsGuest(false);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const loginAsGuest = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser("Guest");
    setIsGuest(true);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isGuest,
    token,
    login,
    loginAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
