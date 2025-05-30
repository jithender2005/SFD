import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  username: string;
  email: string;
  token: string;
};

type AuthStatus = "idle" | "loading" | "error";

const STORAGE_KEY = "sf_user";

function saveUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}

function getUser(): User | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(getUser());
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setStatus("loading");
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: name, email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.message || "Signup failed. Please try again.");
      }

      setStatus("idle");
      navigate("/signin");
      return true;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
      return false;
    }
  }, [navigate]);

  const signin = useCallback(async (email: string, password: string) => {
    setStatus("loading");
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Invalid credentials");
      }

      const userData = {
        username: email.split("@")[0],
        email: email,
        token: data.access_token,
      };
      saveUser(userData);
      setUser(userData);
      setStatus("idle");
      navigate("/upload");
      return true;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Signin failed. Please try again.");
      return false;
    }
  }, [navigate]);

  const logout = useCallback(() => {
    saveUser(null);
    setUser(null);
    navigate("/signin");
  }, [navigate]);

  return { user, status, error, signup, signin, logout };
}
