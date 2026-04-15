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
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ─── Validação local antes de enviar ──────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Nome é obrigatório.";

    if (!form.email.includes("@"))
      newErrors.email = "Digite um e-mail válido. Ex: joao@gmail.com";

    if (!form.phone.trim()) newErrors.phone = "Telefone é obrigatório.";

    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
    if (!cpfRegex.test(form.cpf))
      newErrors.cpf = "CPF inválido. Use o formato 000.000.000-00";

    if (!form.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória.";
    } else {
      const age = Math.floor(
        (Date.now() - new Date(form.birthDate)) /
          (1000 * 60 * 60 * 24 * 365.25),
      );
      if (age < 18)
        newErrors.birthDate =
          "Você precisa ter 18 anos ou mais para se cadastrar.";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "A senha precisa ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial. Ex: Senha@123";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem.";
    }

    return newErrors;
  };

  // ─── Traduz erros do backend ───────────────────────────────────────────────
  const translateBackendError = (message) => {
    if (!message) return "Erro desconhecido. Tente novamente.";
    const msg = message.toLowerCase();

    if (msg.includes("cpf"))
      return "❌ CPF inválido ou já cadastrado. Verifique o formato: 000.000.000-00";
    if (msg.includes("email") || msg.includes("e-mail"))
      return "❌ Este e-mail já está cadastrado ou é inválido.";
    if (msg.includes("senha") || msg.includes("password"))
      return "❌ Senha inválida. Use no mínimo 8 caracteres, maiúscula, número e caractere especial.";
    if (
      msg.includes("18") ||
      msg.includes("maioridade") ||
      msg.includes("idade")
    )
      return "❌ Você precisa ter 18 anos ou mais para se cadastrar.";
    if (msg.includes("unique") || msg.includes("duplicate"))
      return "❌ CPF ou e-mail já cadastrado no sistema.";
    if (msg.includes("notnull") || msg.includes("null"))
      return "❌ Preencha todos os campos obrigatórios.";

    return `❌ ${message}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    // Valida localmente primeiro
    const localErrors = validate();
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await createUser(payload);

      if (res.error) {
        setGlobalError(translateBackendError(res.error));
        return;
      }

      onNavigate("login");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setGlobalError(translateBackendError(msg));
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

          {globalError && <div className="register-error">{globalError}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Nome */}
            <div className="register-group">
              <label className="register-label">Nome completo *</label>
              <input
                className="register-input"
                name="name"
                placeholder="João Silva"
                value={form.name}
                onChange={handle}
                required
              />
              {errors.name && (
                <span className="register-field-error">{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="register-group">
              <label className="register-label">E-mail *</label>
              <input
                className="register-input"
                type="email"
                name="email"
                placeholder="joao@email.com"
                value={form.email}
                onChange={handle}
                required
              />
              {errors.email && (
                <span className="register-field-error">{errors.email}</span>
              )}
            </div>

            {/* Telefone e Data */}
            <div className="register-row">
              <div className="register-group">
                <label className="register-label">Telefone *</label>
                <input
                  className="register-input"
                  name="phone"
                  placeholder="(44) 99999-9999"
                  value={form.phone}
                  onChange={handle}
                  required
                />
                {errors.phone && (
                  <span className="register-field-error">{errors.phone}</span>
                )}
              </div>
              <div className="register-group">
                <label className="register-label">Data de nascimento *</label>
                <input
                  className="register-input"
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handle}
                  required
                />
                {errors.birthDate && (
                  <span className="register-field-error">
                    {errors.birthDate}
                  </span>
                )}
              </div>
            </div>

            {/* CPF */}
            <div className="register-group">
              <label className="register-label">CPF *</label>
              <input
                className="register-input"
                name="cpf"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={handle}
                required
              />
              {errors.cpf && (
                <span className="register-field-error">{errors.cpf}</span>
              )}
            </div>

            {/* Senha */}
            <div className="register-group">
              <label className="register-label">Senha *</label>
              <input
                className="register-input"
                type="password"
                name="password"
                placeholder="Ex: Senha@123"
                value={form.password}
                onChange={handle}
                required
              />
              <span className="register-hint">
                Mín. 8 caracteres, maiúscula, número e caractere especial
              </span>
              {errors.password && (
                <span className="register-field-error">{errors.password}</span>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="register-group">
              <label className="register-label">Confirmar Senha *</label>
              <input
                className="register-input"
                type="password"
                name="confirmPassword"
                placeholder="Repita a senha"
                value={form.confirmPassword}
                onChange={handle}
                required
              />
              {errors.confirmPassword && (
                <span className="register-field-error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <p className="register-footer">
            Já tem conta?{" "}
            <span className="register-link" onClick={() => onNavigate("login")}>
              Entrar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
