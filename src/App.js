import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import VehicleFormPage from "./pages/VehicleFormPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  // Mantemos o usuário aqui por enquanto (no próximo passo vai virar Contexto Global)
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal */}
        <Route path="/" element={<Home currentUser={currentUser} />} />

        {/* Rotas de Autenticação */}
        <Route
          path="/login"
          element={
            <LoginPage onLogin={handleLogin} currentUser={currentUser} />
          }
        />
        <Route
          path="/register"
          element={<RegisterPage currentUser={currentUser} />}
        />

        {/* Rotas de Veículos (Note o ":id", ele substitui o seu pageParams!) */}
        <Route
          path="/veiculo/:id"
          element={<VehicleDetailPage currentUser={currentUser} />}
        />
        <Route
          path="/anunciar"
          element={<VehicleFormPage currentUser={currentUser} />}
        />
        <Route
          path="/editar-veiculo/:id"
          element={<VehicleFormPage currentUser={currentUser} />}
        />

        {/* Rota de Perfil */}
        <Route
          path="/perfil/:id"
          element={
            <ProfilePage currentUser={currentUser} onLogout={handleLogout} />
          }
        />

        {/* Rota de fallback (Se digitar uma URL que não existe, manda pra Home) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
