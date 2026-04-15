import "./Navbar.css";

export default function Navbar({ onNavigate, currentUser, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => onNavigate("home")}>
        <img
          src="/logofull2.png"
          alt="AutoZoom"
          className="navbar-logo"
        />
      </div>

      <div className="navbar-links">
        {currentUser && (
          <button
            className="navbar-link"
            onClick={() => onNavigate("new-vehicle")}
          >
            + Anunciar
          </button>
        )}
      </div>

      <div>
        {currentUser ? (
          <div className="navbar-user-actions">
            <span
              className="navbar-user-btn"
              onClick={() => onNavigate("profile", { userId: currentUser.id })}
            >
              👤 {currentUser.name?.split(" ")[0]}
            </span>

            <button className="navbar-btn-red" onClick={onLogout}>
              Sair
            </button>
          </div>
        ) : (
          <div className="navbar-auth-actions">
            <button
              className="navbar-btn-outline"
              onClick={() => onNavigate("login")}
            >
              Entrar
            </button>

            <button
              className="navbar-btn-solid"
              onClick={() => onNavigate("register")}
            >
              Cadastrar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}