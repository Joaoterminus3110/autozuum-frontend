import { useState } from "react";
import { login } from "../servicos/api";
import Navbar from "../components/Navbar";
import "./LoginPage.css"; // 👈 Importação do arquivo de estilos

export default function LoginPage({ onNavigate, onLogin, currentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      // Salva o token no localStorage
      localStorage.setItem("token", res.token);
      // Salva o usuário no estado global
      onLogin(res.user);
      onNavigate("home");
    } catch (err) {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar onNavigate={onNavigate} currentUser={currentUser} />

      <div className="center-content">
        <div className="login-card">
          <h2 className="login-title">Entrar</h2>
          <p className="login-subtitle">Acesse sua conta para negociar</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <label className="form-label">E-mail</label>
            <input
              className="form-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="form-label">Senha</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="login-footer">
            Não tem conta?{" "}
            <span
              className="footer-link"
              onClick={() => onNavigate("register")}
            >
              Cadastrar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
