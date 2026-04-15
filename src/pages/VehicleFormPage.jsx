import { useState, useEffect } from "react";
import {
  createVehicle,
  updateVehicle,
  getVehicleById,
  deleteVehicle,
} from "../servicos/api";
import api from "../servicos/api";
import Navbar from "../components/Navbar";
import "./VehicleFormPage.css";

const FEATURES = [
  "Airbag",
  "ABS",
  "Ar Condicionado",
  "Direção Elétrica",
  "Vidro Elétrico",
  "Travas Elétricas",
  "Câmera de Ré",
  "Sensor de Estacionamento",
  "Teto Solar",
  "Bancos de Couro",
  "Central Multimídia",
  "Bluetooth",
  "GPS",
  "Rodas de Liga Leve",
  "Alarme",
];

export default function VehicleFormPage({
  onNavigate,
  currentUser,
  vehicleId,
}) {
  const isEdit = Boolean(vehicleId);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    engine: "",
    transmission: "Manual",
    manufactureYear: "",
    modelYear: "",
    price: "",
    mileage: "",
    location: "",
    description: "",
    features: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState([]);
  const [savedVehicleId, setSavedVehicleId] = useState(vehicleId || null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      onNavigate("login");
      return;
    }

    if (isEdit) {
      getVehicleById(vehicleId).then((v) => {
        if (v && !v.error) {
          setForm({ ...v, features: v.features || [] });
          setImages(v.VehicleImages || []);
        }
      });
    }
  }, [currentUser, isEdit, onNavigate, vehicleId]);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleFeature = (f) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter((x) => x !== f)
        : [...prev.features, f],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        mileage: Number(form.mileage),
        manufactureYear: Number(form.manufactureYear),
        modelYear: Number(form.modelYear),
      };

      const res = isEdit
        ? await updateVehicle(vehicleId, payload)
        : await createVehicle(payload);

      if (res.error) {
        setError(res.error);
        return;
      }

      if (!isEdit && res.vehicle?.id) {
        setSavedVehicleId(res.vehicle.id);
      } else {
        onNavigate("home");
      }
    } catch {
      setError("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !savedVehicleId) return;

    setUploadError("");
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post(
        `/vehicles/${savedVehicleId}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setImages((prev) => [...prev, res.data]);
    } catch {
      setUploadError("Erro ao enviar foto. Tente novamente.");
    } finally {
      setUploadLoading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Excluir esta foto?")) return;

    try {
      await api.delete(`/vehicles/images/${imageId}`);
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

  if (savedVehicleId && !isEdit) {
    return (
      <div className="vehicle-form-page">
        <Navbar onNavigate={onNavigate} currentUser={currentUser} />

        <div className="vehicle-form-wrap">
          <div className="vehicle-form-card">
            <div className="vehicle-form-success-banner">
              ✅ Veículo publicado com sucesso!
            </div>

            <h2 className="vehicle-form-title">Adicionar Fotos</h2>

            <p className="vehicle-form-upload-text">
              Adicione fotos do veículo para atrair mais compradores.
            </p>

            <ImageSection
              images={images}
              onUpload={handleUpload}
              onDelete={handleDeleteImage}
              uploadLoading={uploadLoading}
              uploadError={uploadError}
            />

            <button
              className="vehicle-form-btn vehicle-form-btn-full"
              onClick={() => onNavigate("home")}
            >
              Concluir e ir para a Vitrine →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-form-page">
      <Navbar onNavigate={onNavigate} currentUser={currentUser} />

      <div className="vehicle-form-wrap">
        <div className="vehicle-form-card">
          <button className="vehicle-form-back" onClick={() => onNavigate("home")}>
            ← Voltar
          </button>

          <h2 className="vehicle-form-title">
            {isEdit ? "Editar Anúncio" : "Anunciar Veículo"}
          </h2>

          {error && <div className="vehicle-form-error">{error}</div>}

          <form onSubmit={handleSubmit} className="vehicle-form-form">
            <p className="vehicle-form-section">Identificação</p>

            <div className="vehicle-form-row">
              <div className="vehicle-form-group">
                <label className="vehicle-form-label">Marca *</label>
                <input
                  className="vehicle-form-input"
                  name="brand"
                  placeholder="Toyota"
                  value={form.brand}
                  onChange={handle}
                  required
                />
              </div>

              <div className="vehicle-form-group">
                <label className="vehicle-form-label">Modelo *</label>
                <input
                  className="vehicle-form-input"
                  name="model"
                  placeholder="Corolla"
                  value={form.model}
                  onChange={handle}
                  required
                />
              </div>
            </div>

            <div className="vehicle-form-row">
              <div className="vehicle-form-group">
                <label className="vehicle-form-label">Ano Fabricação *</label>
                <input
                  className="vehicle-form-input"
                  type="number"
                  name="manufactureYear"
                  placeholder="2020"
                  value={form.manufactureYear}
                  onChange={handle}
                  required
                />
              </div>

              <div className="vehicle-form-group">
                <label className="vehicle-form-label">Ano Modelo *</label>
                <input
                  className="vehicle-form-input"
                  type="number"
                  name="modelYear"
                  placeholder="2021"
                  value={form.modelYear}
                  onChange={handle}
                  required
                />
              </div>
            </div>

            <p className="vehicle-form-section">Mecânica</p>

            <div className="vehicle-form-row">
              <div className="vehicle-form-group">
                <label className="vehicle-form-label">Motor *</label>
                <input
                  className="vehicle-form-input"
                  name="engine"
                  placeholder="2.0 Turbo"
                  value={form.engine}
                  onChange={handle}
                  required
                />
              </div>

              <div className="vehicle-form-group">
                <label className="vehicle-form-label">Câmbio *</label>
                <select
                  className="vehicle-form-input"
                  name="transmission"
                  value={form.transmission}
                  onChange={handle}
                >
                  <option>Manual</option>
                  <option>Automático</option>
                  <option>CVT</option>
                </select>
              </div>
            </div>

            <div className="vehicle-form-row">
              <div className="vehicle-form-group">
                <label className="vehicle-form-label">Quilometragem *</label>
                <input
                  className="vehicle-form-input"
                  type="number"
                  name="mileage"
                  placeholder="50000"
                  value={form.mileage}
                  onChange={handle}
                  required
                />
              </div>

              <div className="vehicle-form-group">
                <label className="vehicle-form-label">Preço (R$) *</label>
                <input
                  className="vehicle-form-input"
                  type="number"
                  name="price"
                  placeholder="45000"
                  value={form.price}
                  onChange={handle}
                  required
                />
              </div>
            </div>

            <p className="vehicle-form-section">Localização & Descrição</p>

            <div className="vehicle-form-group">
              <label className="vehicle-form-label">Cidade/Estado *</label>
              <input
                className="vehicle-form-input"
                name="location"
                placeholder="Campo Mourão - PR"
                value={form.location}
                onChange={handle}
                required
              />
            </div>

            <div className="vehicle-form-group">
              <label className="vehicle-form-label">Descrição *</label>
              <textarea
                className="vehicle-form-input vehicle-form-textarea"
                name="description"
                rows={4}
                placeholder="Estado do veículo, histórico..."
                value={form.description}
                onChange={handle}
                required
              />
            </div>

            <p className="vehicle-form-section">Opcionais</p>

            <div className="vehicle-form-features">
              {FEATURES.map((f) => (
                <label
                  key={f}
                  className={`vehicle-form-feature-tag ${
                    form.features.includes(f)
                      ? "vehicle-form-feature-active"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="vehicle-form-hidden-checkbox"
                    checked={form.features.includes(f)}
                    onChange={() => toggleFeature(f)}
                  />
                  {f}
                </label>
              ))}
            </div>

            {isEdit && (
              <>
                <p className="vehicle-form-section">Fotos</p>

                <ImageSection
                  images={images}
                  onUpload={handleUpload}
                  onDelete={handleDeleteImage}
                  uploadLoading={uploadLoading}
                  uploadError={uploadError}
                />
              </>
            )}

            <div className="vehicle-form-actions">
              {isEdit && (
                <button
                  type="button"
                  className="vehicle-form-btn-danger"
                  onClick={handleDelete}
                >
                  Excluir Anúncio
                </button>
              )}

              <button
                type="submit"
                className="vehicle-form-btn"
                disabled={loading}
              >
                {loading
                  ? "Salvando..."
                  : isEdit
                  ? "Salvar"
                  : "Publicar e Adicionar Fotos →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ImageSection({
  images,
  onUpload,
  onDelete,
  uploadLoading,
  uploadError,
}) {
  return (
    <div>
      {uploadError && <div className="vehicle-form-error">{uploadError}</div>}

      {images.length > 0 && (
        <div className="vehicle-form-img-grid">
          {images.map((img) => (
            <div key={img.id} className="vehicle-form-img-item">
              <img
                src={`http://localhost:3333${img.url}`}
                alt="foto do veículo"
                className="vehicle-form-img-thumb"
              />
              <button
                className="vehicle-form-img-delete"
                onClick={() => onDelete(img.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="vehicle-form-upload-btn">
        {uploadLoading ? "Enviando..." : "📷 Adicionar Foto"}
        <input
          type="file"
          accept="image/*"
          className="vehicle-form-file-input"
          onChange={onUpload}
          disabled={uploadLoading}
        />
      </label>

      <p className="vehicle-form-upload-hint">
        Formatos aceitos: JPG, PNG, WEBP
      </p>
    </div>
  );
}