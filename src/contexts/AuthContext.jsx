import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient, { setAccessToken } from "../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await apiClient.get("/auth/refresh", {
          timeout: 8000,
        });

        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken);
          setUser(response.data.user || { role: "admin" });
        } else {
          setAccessToken("");
          setUser(null);
        }
      } catch (error) {
        setAccessToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Intercept refresh token failures globally to sign out the user
  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.isRefreshFailed) {
          setAccessToken("");
          setUser(null);
        }
        return Promise.reject(error);
      },
    );
    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (emailOrUsername, password) => {
    try {
      const isEmail = emailOrUsername.includes("@");
      const payload = isEmail
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password };

      const response = await apiClient.post("/auth/login", payload);
      const { accessToken: token, user: userData } = response.data;
      setAccessToken(token);
      setUser(userData || { role: "admin", username: emailOrUsername });
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Invalid username/email or password",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiClient.post("/auth/register", {
        name,
        email,
        password,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      setAccessToken("");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === "admin" || user?.isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
