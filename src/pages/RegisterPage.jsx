import { useState } from "react";
import { createUser } from "../servicos/api";
import Navbar from "../components/Navbar";
import "./RegisterPage.css";

export default function RegisterPage({ onNavigate, currentUser }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    cpf: "",
    password_hash: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await createUser(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      onNavigate("login");
    } catch (err) {
      setError(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Navbar onNavigate={onNavigate} currentUser={currentUser} />

      <div className="register-center">
        <div className="register-card">
          <h2 className="register-title">Criar Conta</h2>
          <p className="register-sub">Preencha seus dados para começar</p>

          {error && <div className="register-error">{error}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-row">
              <div className="register-group">
                <label className="register-label">Nome completo</label>
                <input
                  className="register-input"
                  name="name"
                  placeholder="João Silva"
                  value={form.name}
                  onChange={handle}
                  required
                />
              </div>

              <div className="register-group">
                <label className="register-label">Data de nascimento</label>
                <input
                  className="register-input"
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handle}
                  required
                />
              </div>
            </div>

            <div className="register-group">
              <label className="register-label">E-mail</label>
              <input
                className="register-input"
                type="email"
                name="email"
                placeholder="joao@email.com"
                value={form.email}
                onChange={handle}
                required
              />
            </div>

            <div className="register-row">
              <div className="register-group">
                <label className="register-label">Telefone</label>
                <input
                  className="register-input"
                  name="phone"
                  placeholder="(44) 99999-9999"
                  value={form.phone}
                  onChange={handle}
                  required
                />
              </div>

              <div className="register-group">
                <label className="register-label">CPF</label>
                <input
                  className="register-input"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={handle}
                  required
                />
              </div>
            </div>

            <div className="register-group">
              <label className="register-label">Senha</label>
              <input
                className="register-input"
                type="password"
                name="password"
                placeholder="Mín. 8 chars, maiúscula, número e especial"
                value={form.password}
                onChange={handle}
                required
              />
              <span className="register-hint">Ex: Senha@123</span>
            </div>

            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <p className="register-footer">
            Já tem conta?{" "}
            <span
              className="register-link"
              onClick={() => onNavigate("login")}
            >
              Entrar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}