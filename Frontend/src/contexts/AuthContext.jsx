import React, { createContext, useState, useContext, useEffect } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const decodeToken = (jwt) => {
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      return {
        username: payload.username,
        userId: payload.user_id,
      };
    } catch (e) {
      console.error("Invalid token", e);
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser(decoded);
      } else {
        logout();
      }
    }
  }, [token]);

  const login = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      const decoded = decodeToken(data.access_token);
      setUser(decoded);
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
