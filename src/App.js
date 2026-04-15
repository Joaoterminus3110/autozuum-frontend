import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import VehicleFormPage from "./pages/VehicleFormPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Rota principal */}
          <Route path="/" element={<Home />} />

          {/* Rotas de Autenticação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rotas de Veículos (Note o ":id", ele substitui o seu pageParams!) */}
          <Route path="/veiculo/:id" element={<VehicleDetailPage />} />
          <Route path="/anunciar" element={<VehicleFormPage />} />
          <Route path="/editar-veiculo/:id" element={<VehicleFormPage />} />

          {/* Rota de Perfil */}
          <Route path="/perfil/:id" element={<ProfilePage />} />

          {/* Rota de fallback (Se digitar uma URL que não existe, manda pra Home) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
