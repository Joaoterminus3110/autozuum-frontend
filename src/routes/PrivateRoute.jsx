import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function PrivateRoute() {
  const { currentUser } = useContext(AuthContext);

  // Se o usuário existir, ele deixa "passar" (Outlet)
  // Se não existir, ele chuta para o login
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
}
