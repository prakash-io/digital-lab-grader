import { createContext, useContext, useState, useEffect } from "react";

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
          const response = await fetch("http://localhost:3001/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const userData = data.user;
            
            // Load user's purchased avatars and coins from localStorage
            if (userData.id) {
              const storedUserData = localStorage.getItem(`userData_${userData.id}`);
              if (storedUserData) {
                const { coins, purchasedAvatars } = JSON.parse(storedUserData);
                userData.coins = coins;
                userData.purchasedAvatars = purchasedAvatars;
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
    // Load user's purchased avatars and coins from localStorage
    if (userData.id) {
      const storedUserData = localStorage.getItem(`userData_${userData.id}`);
      if (storedUserData) {
        const { coins, purchasedAvatars } = JSON.parse(storedUserData);
        userData.coins = coins;
        userData.purchasedAvatars = purchasedAvatars;
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
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        throw new Error("No token found");
      }

      // Update user in state
      setUser(updatedUserData);
      
      // In a real app, you would make an API call here to update the user on the server
      // For now, we'll just update the local state
      // Example API call:
      // const response = await fetch("http://localhost:3001/api/auth/update-profile", {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${storedToken}`,
      //   },
      //   body: JSON.stringify(updatedUserData),
      // });
      
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

