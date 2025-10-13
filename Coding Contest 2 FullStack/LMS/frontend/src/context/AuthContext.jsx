import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password },
        config
      );

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "An error occurred during login";
      setError(message);
      return { success: false, message };
    }
  };

  // Signup function
  const signup = async (name, email, password, role) => {
    try {
      setError(null);
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        { name, email, password, role },
        config
      );

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "An error occurred during signup";
      setError(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
