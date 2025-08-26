import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      // You might want to verify the token with the backend here
      // For simplicity, we'll just decode it (not secure for production)
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUser(decodedToken.sub);
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
    } else {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const loginAsGuest = () => {
    const guestUser = {
      name: "Guest",
      email: "guest@example.com",
      username: "Guest",
    };
    localStorage.removeItem("token");
    setToken(null);
    setUser(guestUser);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    token,
    login,
    loginAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
