import { createContext, useState, useEffect } from "react";

// 1. Criamos o Contexto (A nossa Centralina)
export const AuthContext = createContext();

// 2. Criamos o Provedor (Quem vai abraçar o aplicativo e distribuir os dados)
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Assim que o site abre, ele checa se já tem alguém salvo no porta-luvas (localStorage)
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (user && token) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // Função central para fazer login
  const handleLogin = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setCurrentUser(userData);
  };

  // Função central para sair
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, handleLogin, handleLogout }}>
      {/* O 'children' é o seu aplicativo inteiro, que vai ficar aqui dentro */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
