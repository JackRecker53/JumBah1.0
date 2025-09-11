import React, { createContext, useState, useContext, useEffect } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage'));

  useEffect(() => {
    if (token) {
      // You might want to verify the token with the backend here
      // For simplicity, we'll just decode it (not secure for production)
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUser({
          username: decodedToken.username,
          user_id: decodedToken.user_id,
          profileImage: profileImage
        });
      } catch (e) {
        console.error("Invalid token", e);
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
      const decodedToken = JSON.parse(atob(data.access_token.split(".")[1]));
      setUser({
        username: decodedToken.username,
        user_id: decodedToken.user_id,
        profileImage: profileImage
      });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem('profileImage');
    setToken(null);
    setProfileImage(null);
    setUser(null);
  };

  const updateProfileImage = (imageUrl) => {
    setProfileImage(imageUrl);
    localStorage.setItem('profileImage', imageUrl);
    if (user) {
      setUser(prev => ({ ...prev, profileImage: imageUrl }));
    }
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
    updateProfileImage,
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
