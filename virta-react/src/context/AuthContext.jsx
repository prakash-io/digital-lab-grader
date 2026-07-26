import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const data = await authService.verifyToken(storedToken);
          if (data.success && data.user) {
            const userData = data.user;
            
            // Load user's purchased avatars and coins from localStorage
            if (userData.id) {
              const storedUserData = localStorage.getItem(`userData_${userData.id}`);
              if (storedUserData) {
                try {
                  const { coins, purchasedAvatars } = JSON.parse(storedUserData);
                  userData.coins = coins;
                  userData.purchasedAvatars = purchasedAvatars;
                } catch (e) {
                  console.error("Error parsing user extra data:", e);
                }
              }
            }
            
            setUser(userData);
            setToken(storedToken);
          } else {
            localStorage.removeItem("token");
            setToken(null);
          }
        } catch (error) {
          console.error("Auth check error:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, authToken) => {
    if (userData?.id) {
      const storedUserData = localStorage.getItem(`userData_${userData.id}`);
      if (storedUserData) {
        try {
          const { coins, purchasedAvatars } = JSON.parse(storedUserData);
          userData.coins = coins;
          userData.purchasedAvatars = purchasedAvatars;
        } catch (e) {
          console.error("Error loading user extra data:", e);
        }
      }
    }
    
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const updateUser = async (updatedUserData) => {
    try {
      setUser(updatedUserData);
      return updatedUserData;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
