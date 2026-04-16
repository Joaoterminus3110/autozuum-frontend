import { createContext, useState, useEffect, ReactNode } from "react";
import { IUser } from "../types/index"; // Importando sua Interface Global

// Definimos o que o nosso Contexto oferece para o App
interface AuthContextType {
  currentUser: IUser | null;
  handleLogin: (userData: IUser, token: string) => void;
  handleLogout: () => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (user && token) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (error) {
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: IUser, token: string) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, handleLogin, handleLogout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
