import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import VehicleFormPage from "./pages/VehicleFormPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";
import ProposalDetailPage from "./pages/ProposalDetailPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* 🌍 Rotas Públicas (Qualquer um vê) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/veiculo/:id" element={<VehicleDetailPage />} />
          <Route path="/perfil/:id" element={<ProfilePage />} />

          {/* 🔒 Rotas Protegidas (SÓ para quem tem login) */}
          <Route element={<PrivateRoute />}>
            <Route path="/anunciar" element={<VehicleFormPage />} />
            <Route path="/editar-veiculo/:id" element={<VehicleFormPage />} />
            <Route path="/proposta/:id" element={<ProposalDetailPage />} />
            {/* Qualquer rota que você colocar aqui dentro estará protegida automaticamente! */}
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
