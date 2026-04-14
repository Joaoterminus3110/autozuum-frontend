import { useState, useEffect } from "react";
import { createVehicle, updateVehicle, getVehicleById, deleteVehicle } from "../servicos/api";
import api from "../servicos/api";
import Navbar from "../components/Navbar";

const FEATURES = ["Airbag", "ABS", "Ar Condicionado", "Direção Elétrica", "Vidro Elétrico", "Travas Elétricas", "Câmera de Ré", "Sensor de Estacionamento", "Teto Solar", "Bancos de Couro", "Central Multimídia", "Bluetooth", "GPS", "Rodas de Liga Leve", "Alarme"];

const BASE = "http://localhost:3333";

export default function VehicleFormPage({ onNavigate, currentUser, vehicleId }) {
  const isEdit = Boolean(vehicleId);
  const [form, setForm] = useState({ brand: "", model: "", engine: "", transmission: "Manual", manufactureYear: "", modelYear: "", price: "", mileage: "", location: "", description: "", features: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Estados de imagem ────────────────────────────────────────────────────
  const [images, setImages] = useState([]);          // imagens já salvas no servidor
  const [savedVehicleId, setSavedVehicleId] = useState(vehicleId || null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!currentUser) { onNavigate("login"); return; }
    if (isEdit) {
      getVehicleById(vehicleId).then((v) => {
        if (v && !v.error) {
          setForm({ ...v, features: v.features || [] });
          setImages(v.VehicleImages || []);
        }
      });
    }
  }, [vehicleId]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleFeature = (f) => setForm((prev) => ({
    ...prev,
    features: prev.features.includes(f) ? prev.features.filter((x) => x !== f) : [...prev.features, f],
  }));

  // ─── Salvar veículo ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price), mileage: Number(form.mileage), manufactureYear: Number(form.manufactureYear), modelYear: Number(form.modelYear) };
      const res = isEdit ? await updateVehicle(vehicleId, payload) : await createVehicle(payload);
      if (res.error) { setError(res.error); return; }

      // Guarda o ID do veículo recém criado para o upload de fotos
      if (!isEdit && res.vehicle?.id) {
        setSavedVehicleId(res.vehicle.id);
      } else {
        onNavigate("home");
      }
    } catch { setError("Erro ao salvar."); }
    finally { setLoading(false); }
  };

  // ─── Upload de foto ───────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !savedVehicleId) return;

    setUploadError("");
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);   // nome do campo exigido pelo backend

      const res = await api.post(
        /vehicles/${savedVehicleId}/images,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Adiciona a nova imagem na lista
      setImages((prev) => [...prev, res.data]);
    } catch {
      setUploadError("Erro ao enviar foto. Tente novamente.");
    } finally {
      setUploadLoading(false);
      e.target.value = "";  // limpa o input para permitir reenvio
    }
  };

  // ─── Excluir foto ─────────────────────────────────────────────────────────
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Excluir esta foto?")) return;
    try {
      await api.delete(/vehicles/images/${imageId});
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      alert("Erro ao excluir foto.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Excluir este anúncio?")) return;
    await deleteVehicle(vehicleId);
    onNavigate("home");
  };

  // ─── Se acabou de criar o veículo, mostra tela de upload ─────────────────
  if (savedVehicleId && !isEdit) {
    return (
      <div style={s.page}>
        <Navbar onNavigate={onNavigate} currentUser={currentUser} />
        <div style={s.wrap}>
          <div style={s.card}>
            <div style={s.successBanner}>✅ Veículo publicado com sucesso!</div>
            <h2 style={s.title}>Adicionar Fotos</h2>
            <p style={{ color: "#888", fontSize: 14, marginBottom: "1.5rem" }}>
              Adicione fotos do veículo para atrair mais compradores.
            </p>

            <ImageSection
              images={images}
              onUpload={handleUpload}
              onDelete={handleDeleteImage}
              uploadLoading={uploadLoading}
              uploadError={uploadError}
            />

            <button style={{ ...s.btn, marginTop: "1.5rem", width: "100%" }} onClick={() => onNavigate("home")}>
              Concluir e ir para a Vitrine →
            </button>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Fotos no modo edição */}
            {isEdit && (
              <>
                <p style={s.section}>Fotos</p>
                <ImageSection
                  images={images}
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                  uploadLoading={uploadLoading}
                  uploadError={uploadError}
                />
              </>
            )}

            <div style={s.actions}>
              {isEdit && <button type="button" style={s.btnDanger} onClick={handleDelete}>Excluir Anúncio</button>}
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? "Salvando..." : isEdit ? "Salvar" : "Publicar e Adicionar Fotos →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Componente de imagens ────────────────────────────────────────────────────
function ImageSection({ images, onUpload, onDelete, uploadLoading, uploadError }) {
  return (
    <div>
      {uploadError && <div style={s.error}>{uploadError}</div>}

      {/* Grid de fotos salvas */}
      {images.length > 0 && (
        <div style={s.imgGrid}>
          {images.map((img) => (
            <div key={img.id} style={s.imgItem}>
              <img
                src={http://localhost:3333${img.url}}
                alt="foto do veículo"
                style={s.imgThumb}
              />
              <button style={s.imgDelete} onClick={() => onDelete(img.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Botão de upload */}
      <label style={s.uploadBtn}>
        {uploadLoading ? "Enviando..." : "📷 Adicionar Foto"}
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onUpload}
          disabled={uploadLoading}
        />
      </label>
      <p style={{ fontSize: 11, color: "#555", marginTop: 6 }}>
        Formatos aceitos: JPG, PNG, WEBP
      </p>
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
  section: { fontWeight: 700, fontSize: 12, color: "#ff4545", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 8 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  group: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#888" },
  input: { background: "#1e2022", border: "1px solid #2a2c2f", color: "#f0f0ee", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", width: "100%" },
  features: { display: "flex", flexWrap: "wrap", gap: 8 },
  featureTag: { padding: "6px 12px", borderRadius: 20, border: "1px solid #2a2c2f", color: "#888", fontSize: 13, cursor: "pointer" },
  featureActive: { background: "rgba(255,69,69,0.1)", borderColor: "rgba(255,69,69,0.4)", color: "#ff4545" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  btn: { background: "#1a6b1a", color: "#3affb0", border: "1px solid #3affb0", borderRadius: 8, padding: "10px 24px", fontWeight: 800, cursor: "pointer" },
  btnDanger: { background: "rgba(255,69,69,0.15)", color: "#ff4545", border: "1px solid #ff4545", borderRadius: 8, padding: "10px 20px", cursor: "pointer" },
  error: { background: "rgba(255,69,69,0.12)", border: "1px solid rgba(255,69,69,0.3)", color: "#ff4545", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 8 },
  successBanner: { background: "rgba(58,255,176,0.1)", border: "1px solid #3affb0", color: "#3affb0", borderRadius: 8, padding: "12px 16px", fontSize: 14, marginBottom: "1.5rem" },
  imgGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 12 },
  imgItem: { position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1/1", background: "#1e2022" },
  imgThumb: { width: "100%", height: "100%", objectFit: "cover" },
  imgDelete: { position: "absolute", top: 4, right: 4, background: "rgba(255,69,69,0.85)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" },
  uploadBtn: { display: "inline-block", background: "#1e2022", border: "1px dashed #2a2c2f", color: "#888", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, transition: "border-color 0.2s" },
};