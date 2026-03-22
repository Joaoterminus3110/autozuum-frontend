import { useState, useEffect } from "react";
import { createVehicle, updateVehicle, getVehicleById, deleteVehicle } from "../servicos/api";
import Navbar from "../components/Navbar";

const FEATURES = ["Airbag", "ABS", "Ar Condicionado", "Direção Elétrica", "Vidro Elétrico", "Travas Elétricas", "Câmera de Ré", "Sensor de Estacionamento", "Teto Solar", "Bancos de Couro", "Central Multimídia", "Bluetooth", "GPS", "Rodas de Liga Leve", "Alarme"];

export default function VehicleFormPage({ onNavigate, currentUser, vehicleId }) {
  const isEdit = Boolean(vehicleId);
  const [form, setForm] = useState({ brand: "", model: "", engine: "", transmission: "Manual", manufactureYear: "", modelYear: "", price: "", mileage: "", location: "", description: "", features: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) { onNavigate("login"); return; }
    if (isEdit) getVehicleById(vehicleId).then((v) => { if (v && !v.error) setForm({ ...v, features: v.features || [] }); });
  }, [vehicleId]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleFeature = (f) => setForm((prev) => ({
    ...prev,
    features: prev.features.includes(f) ? prev.features.filter((x) => x !== f) : [...prev.features, f],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price), mileage: Number(form.mileage), manufactureYear: Number(form.manufactureYear), modelYear: Number(form.modelYear) };
      const res = isEdit ? await updateVehicle(vehicleId, payload) : await createVehicle(payload);
      if (res.error) { setError(res.error); return; }
      onNavigate("home");
    } catch { setError("Erro ao salvar."); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Excluir este anúncio?")) return;
    await deleteVehicle(vehicleId);
    onNavigate("home");
  };

  return (
    <div style={s.page}>
      <Navbar onNavigate={onNavigate} currentUser={currentUser} />
      <div style={s.wrap}>
        <div style={s.card}>
          <button style={s.back} onClick={() => onNavigate("home")}>← Voltar</button>
          <h2 style={s.title}>{isEdit ? "Editar Anúncio" : "Anunciar Veículo"}</h2>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <p style={s.section}>Identificação</p>
            <div style={s.row}>
              <div style={s.group}><label style={s.label}>Marca *</label><input style={s.input} name="brand" placeholder="Toyota" value={form.brand} onChange={handle} required /></div>
              <div style={s.group}><label style={s.label}>Modelo *</label><input style={s.input} name="model" placeholder="Corolla" value={form.model} onChange={handle} required /></div>
            </div>
            <div style={s.row}>
              <div style={s.group}><label style={s.label}>Ano Fabricação *</label><input style={s.input} type="number" name="manufactureYear" placeholder="2020" value={form.manufactureYear} onChange={handle} required /></div>
              <div style={s.group}><label style={s.label}>Ano Modelo *</label><input style={s.input} type="number" name="modelYear" placeholder="2021" value={form.modelYear} onChange={handle} required /></div>
            </div>

            <p style={s.section}>Mecânica</p>
            <div style={s.row}>
              <div style={s.group}><label style={s.label}>Motor *</label><input style={s.input} name="engine" placeholder="2.0 Turbo" value={form.engine} onChange={handle} required /></div>
              <div style={s.group}>
                <label style={s.label}>Câmbio *</label>
                <select style={s.input} name="transmission" value={form.transmission} onChange={handle}>
                  <option>Manual</option><option>Automático</option><option>CVT</option>
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div style={s.group}><label style={s.label}>Quilometragem *</label><input style={s.input} type="number" name="mileage" placeholder="50000" value={form.mileage} onChange={handle} required /></div>
              <div style={s.group}><label style={s.label}>Preço (R$) *</label><input style={s.input} type="number" name="price" placeholder="45000" value={form.price} onChange={handle} required /></div>
            </div>

            <p style={s.section}>Localização & Descrição</p>
            <div style={s.group}><label style={s.label}>Cidade/Estado *</label><input style={s.input} name="location" placeholder="Campo Mourão - PR" value={form.location} onChange={handle} required /></div>
            <div style={s.group}><label style={s.label}>Descrição *</label><textarea style={{ ...s.input, resize: "vertical" }} name="description" rows={4} placeholder="Estado do veículo, histórico..." value={form.description} onChange={handle} required /></div>

            <p style={s.section}>Opcionais</p>
            <div style={s.features}>
              {FEATURES.map((f) => (
                <label key={f} style={{ ...s.featureTag, ...(form.features.includes(f) ? s.featureActive : {}) }}>
                  <input type="checkbox" style={{ display: "none" }} checked={form.features.includes(f)} onChange={() => toggleFeature(f)} />
                  {f}
                </label>
              ))}
            </div>

            <div style={s.actions}>
              {isEdit && <button type="button" style={s.btnDanger} onClick={handleDelete}>Excluir</button>}
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? "Salvando..." : isEdit ? "Salvar" : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0c0d0f" },
  wrap: { maxWidth: 720, margin: "0 auto", padding: "2rem" },
  card: { background: "#161719", border: "1px solid #2a2c2f", borderRadius: 16, padding: "2.5rem" },
  back: { background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, marginBottom: 16 },
  title: { fontWeight: 800, fontSize: "1.6rem", color: "#f0f0ee", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  section: { fontWeight: 700, fontSize: 12, color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 8 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  group: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#888" },
  input: { background: "#1e2022", border: "1px solid #2a2c2f", color: "#f0f0ee", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", width: "100%" },
  features: { display: "flex", flexWrap: "wrap", gap: 8 },
  featureTag: { padding: "6px 12px", borderRadius: 20, border: "1px solid #2a2c2f", color: "#888", fontSize: 13, cursor: "pointer" },
  featureActive: { background: "rgba(232,255,58,0.1)", borderColor: "rgba(232,255,58,0.4)", color: "#e8ff3a" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  btn: { background: "#e8ff3a", color: "#000", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 800, cursor: "pointer" },
  btnDanger: { background: "rgba(255,69,69,0.15)", color: "#ff4545", border: "1px solid #ff4545", borderRadius: 8, padding: "10px 20px", cursor: "pointer" },
  error: { background: "rgba(255,69,69,0.12)", border: "1px solid rgba(255,69,69,0.3)", color: "#ff4545", borderRadius: 8, padding: "10px 14px", fontSize: 14 },
};