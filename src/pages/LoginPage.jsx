import { useState } from "react";
import { login } from "../servicos/api";
import Navbar from "../components/Navbar";

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
      localStorage.setItem('token', res.token);
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
    <div style={s.page}>
      <Navbar onNavigate={onNavigate} currentUser={currentUser} />
      <div style={s.center}>
        <div style={s.card}>
          <h2 style={s.title}>Entrar</h2>
          <p style={s.sub}>Acesse sua conta para negociar</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>E-mail</label>
            <input
              style={s.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label style={s.label}>Senha</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p style={s.footer}>
            Não tem conta?{" "}
            <span style={s.link} onClick={() => onNavigate("register")}>
              Cadastrar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0c0d0f" },
  center: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 64px)", padding: "2rem" },
  card: { background: "#161719", border: "1px solid #2a2c2f", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 420 },
  title: { fontWeight: 800, fontSize: "1.8rem", color: "#f0f0ee", marginBottom: 4 },
  sub: { color: "#888", fontSize: 14, marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  label: { fontSize: 12, color: "#888", fontWeight: 500 },
  input: { background: "#1e2022", border: "1px solid #2a2c2f", color: "#f0f0ee", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" },
  btn: { background: "#044040", color: "#3affb0", border: "1px solid #3affb0", borderRadius: 8, padding: "12px", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 4 },
  error: { background: "rgba(255,69,69,0.12)", border: "1px solid rgba(255,69,69,0.3)", color: "#ff4545", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 12 },
  footer: { textAlign: "center", marginTop: "1.5rem", color: "#888", fontSize: 14 },
  link: { color: "#ff4545", cursor: "pointer", textDecoration: "underline" },
};