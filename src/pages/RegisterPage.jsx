import { useState } from "react";
import { createUser } from "../servicos/api";
import Navbar from "../components/Navbar";

export default function RegisterPage({ onNavigate, currentUser }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", birthDate: "", cpf: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await createUser(form);
      if (res.error) { setError(res.error); return; }
      onNavigate("login");
    } catch (err) {
      setError(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar onNavigate={onNavigate} currentUser={currentUser} />
      <div style={s.center}>
        <div style={s.card}>
          <h2 style={s.title}>Criar Conta</h2>
          <p style={s.sub}>Preencha seus dados para começar</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row}>
              <div style={s.group}>
                <label style={s.label}>Nome completo</label>
                <input style={s.input} name="name" placeholder="João Silva" value={form.name} onChange={handle} required />
              </div>
              <div style={s.group}>
                <label style={s.label}>Data de nascimento</label>
                <input style={s.input} type="date" name="birthDate" value={form.birthDate} onChange={handle} required />
              </div>
            </div>

            <div style={s.group}>
              <label style={s.label}>E-mail</label>
              <input style={s.input} type="email" name="email" placeholder="joao@email.com" value={form.email} onChange={handle} required />
            </div>

            <div style={s.row}>
              <div style={s.group}>
                <label style={s.label}>Telefone</label>
                <input style={s.input} name="phone" placeholder="(44) 99999-9999" value={form.phone} onChange={handle} required />
              </div>
              <div style={s.group}>
                <label style={s.label}>CPF</label>
                <input style={s.input} name="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={handle} required />
              </div>
            </div>

            <div style={s.group}>
              <label style={s.label}>Senha</label>
              <input style={s.input} type="password" name="password" placeholder="Mín. 8 chars, maiúscula, número e especial" value={form.password} onChange={handle} required />
              <span style={s.hint}>Ex: Senha@123</span>
            </div>

            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <p style={s.footer}>
            Já tem conta?{" "}
            <span style={s.link} onClick={() => onNavigate("login")}>Entrar</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0c0d0f" },
  center: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 64px)", padding: "2rem" },
  card: { background: "#161719", border: "1px solid #2a2c2f", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 520 },
  title: { fontWeight: 800, fontSize: "1.8rem", color: "#f0f0ee", marginBottom: 4 },
  sub: { color: "#888", fontSize: 14, marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  group: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#888", fontWeight: 500 },
  input: { background: "#1e2022", border: "1px solid #2a2c2f", color: "#f0f0ee", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" },
  hint: { fontSize: 11, color: "#555" },
  btn: { background: "#e8ff3a", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 4 },
  error: { background: "rgba(255,69,69,0.12)", border: "1px solid rgba(255,69,69,0.3)", color: "#ff4545", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 12 },
  footer: { textAlign: "center", marginTop: "1.5rem", color: "#888", fontSize: 14 },
  link: { color: "#e8ff3a", cursor: "pointer", textDecoration: "underline" },
};