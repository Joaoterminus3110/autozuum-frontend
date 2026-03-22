import { useState } from "react";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import VehicleFormPage from "./pages/VehicleFormPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const [page, setPage] = useState("home");
  const [pageParams, setPageParams] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = (target, params = {}) => {
    setPage(target);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate("home");
  };

  const props = { onNavigate: navigate, currentUser };

  switch (page) {
    case "login":
      return <LoginPage {...props} onLogin={handleLogin} />;
    case "register":
      return <RegisterPage {...props} />;
    case "vehicle-detail":
      return <VehicleDetailPage {...props} vehicleId={pageParams.vehicleId} />;
    case "new-vehicle":
      return <VehicleFormPage {...props} vehicleId={null} />;
    case "edit-vehicle":
      return <VehicleFormPage {...props} vehicleId={pageParams.vehicleId} />;
    case "profile":
      return <ProfilePage {...props} userId={pageParams.userId} />;
    default:
      return <Home {...props} />;
  }
}