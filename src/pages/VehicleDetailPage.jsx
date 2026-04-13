import { useState, useEffect } from "react";
import {
  getVehicleById,
  createProposal,
  getProposalsByVehicle,
  updateProposalStatus,
  getVehicles,
  getImageUrl,
} from "../servicos/api";
import Navbar from "../components/Navbar";

export default function VehicleDetailPage({
  onNavigate,
  currentUser,
  vehicleId,
}) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [form, setForm] = useState({
    cashOffer: "",
    message: "",
    offeredVehicleId: "",
  });
  const [propError, setPropError] = useState("");
  const [propSuccess, setPropSuccess] = useState("");

  const isOwner = currentUser && vehicle && vehicle.userId === currentUser.id;

  useEffect(() => {
    getVehicleById(vehicleId).then((v) => {
      setVehicle(v);
      setLoading(false);
    });
  }, [vehicleId]);

  useEffect(() => {
    if (isOwner) getProposalsByVehicle(vehicleId).then(setProposals);
  }, [isOwner, vehicleId]);

  useEffect(() => {
    if (currentUser && showForm) {
      getVehicles().then((all) =>
        setMyVehicles(
          all.filter((v) => v.userId === currentUser.id && v.id !== vehicleId),
        ),
      );
    }
  }, [currentUser, showForm]);

  const handleProposal = async (e) => {
    e.preventDefault();
    setPropError("");
    setPropSuccess("");
    const res = await createProposal({
      targetVehicleId: vehicleId,
      cashOffer: Number(form.cashOffer),
      message: form.message,
      offeredVehicleId: form.offeredVehicleId || undefined,
    });
    if (res.error) {
      setPropError(res.error);
      return;
    }
    setPropSuccess("Proposta enviada!");
    setShowForm(false);
  };

  const handleStatus = async (id, status) => {
    await updateProposalStatus(id, status);
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
  };

  if (loading)
    return (
      <div style={s.page}>
        <Navbar onNavigate={onNavigate} currentUser={currentUser} />
        <div style={s.center}>Carregando...</div>
      </div>
    );
  if (!vehicle || vehicle.error)
    return (
      <div style={s.page}>
        <Navbar onNavigate={onNavigate} currentUser={currentUser} />
        <div style={s.center}>Veículo não encontrado.</div>
      </div>
    );

  const images = vehicle.VehicleImages || [];
  const price = Number(vehicle.price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div style={s.page}>
      <Navbar onNavigate={onNavigate} currentUser={currentUser} />
      <div style={s.layout}>
        {/* Galeria */}
        <div>
          <div style={s.imgMain}>
            {images.length > 0 ? (
              <img
                src={getImageUrl(images[imgIndex].url)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={s.noImg}>Sem fotos</div>
            )}
            {images.length > 1 && (
              <div style={s.navRow}>
                <button
                  style={s.navBtn}
                  onClick={() =>
                    setImgIndex((i) => (i - 1 + images.length) % images.length)
                  }
                >
                  ‹
                </button>
                <span style={{ color: "#888", fontSize: 12 }}>
                  {imgIndex + 1}/{images.length}
                </span>
                <button
                  style={s.navBtn}
                  onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                >
                  ›
                </button>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {images.map((img, i) => (
                <img
                  key={img.id}
                  src={getImageUrl(img.url)}
                  alt=""
                  onClick={() => setImgIndex(i)}
                  style={{
                    width: 68,
                    height: 50,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                    opacity: i === imgIndex ? 1 : 0.5,
                    border:
                      i === imgIndex
                        ? "2px solid #e8ff3a"
                        : "2px solid transparent",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1 style={s.name}>
                {vehicle.brand} {vehicle.model}
              </h1>
              <p style={{ color: "#555", fontSize: 13 }}>
                {vehicle.manufactureYear}/{vehicle.modelYear}
              </p>
            </div>
            <span style={s.price}>{price}</span>
          </div>

          <div style={s.specs}>
            {[
              ["Motor", vehicle.engine],
              ["Câmbio", vehicle.transmission],
              ["KM", vehicle.mileage?.toLocaleString("pt-BR")],
              ["Local", vehicle.location],
            ].map(([k, v]) => (
              <div key={k} style={s.spec}>
                <span style={s.specLabel}>{k}</span>
                <strong style={s.specVal}>{v}</strong>
              </div>
            ))}
          </div>

          {vehicle.features?.length > 0 && (
            <div>
              <p style={s.sectionLabel}>Opcionais</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {vehicle.features.map((f) => (
                  <span key={f} style={s.tag}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p style={s.sectionLabel}>Descrição</p>
            <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7 }}>
              {vehicle.description}
            </p>
          </div>

          <div style={s.seller}>
            <div style={s.avatar}>{vehicle.User?.name?.[0]?.toUpperCase()}</div>
            <div>
              <strong style={{ color: "#f0f0ee" }}>{vehicle.User?.name}</strong>
              <p style={{ color: "#555", fontSize: 12 }}>
                {vehicle.User?.email}
              </p>
            </div>
          </div>

          {/* Ações */}
          {!currentUser && (
            <button style={s.btn} onClick={() => onNavigate("login")}>
              Entre para fazer proposta
            </button>
          )}
          {currentUser && !isOwner && (
            <button style={s.btn} onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancelar" : "Fazer Proposta"}
            </button>
          )}
          {isOwner && (
            <button
              style={s.btnOutline}
              onClick={() => onNavigate("edit-vehicle", { vehicleId })}
            >
              Editar Anúncio
            </button>
          )}

          {/* Formulário de Proposta */}
          {showForm && (
            <div style={s.propForm}>
              <h4 style={{ color: "#f0f0ee", marginBottom: 12 }}>
                Sua Proposta
              </h4>
              {propError && <div style={s.error}>{propError}</div>}
              {propSuccess && <div style={s.success}>{propSuccess}</div>}
              <form
                onSubmit={handleProposal}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label style={s.label}>Valor (R$)</label>
                  <input
                    style={s.input}
                    type="number"
                    placeholder="45000"
                    value={form.cashOffer}
                    onChange={(e) =>
                      setForm({ ...form, cashOffer: e.target.value })
                    }
                    required
                  />
                </div>
                {myVehicles.length > 0 && (
                  <div>
                    <label style={s.label}>Oferecer na troca (opcional)</label>
                    <select
                      style={s.input}
                      value={form.offeredVehicleId}
                      onChange={(e) =>
                        setForm({ ...form, offeredVehicleId: e.target.value })
                      }
                    >
                      <option value="">Somente dinheiro</option>
                      {myVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model} ({v.manufactureYear})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label style={s.label}>Mensagem</label>
                  <textarea
                    style={{ ...s.input, resize: "vertical" }}
                    rows={3}
                    placeholder="Pago à vista se fechar hoje!"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />
                </div>
                <button type="submit" style={s.btn}>
                  Enviar Proposta
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Propostas recebidas (dono) */}
      {isOwner && proposals.length > 0 && (
        <div style={s.propSection}>
          <h3 style={{ color: "#f0f0ee", marginBottom: 16 }}>
            Propostas Recebidas ({proposals.length})
          </h3>
          {proposals.map((p) => (
            <div
              key={p.id}
              style={{
                ...s.propCard,
                borderColor:
                  p.status === "ACEITO"
                    ? "rgba(58,255,176,0.3)"
                    : p.status === "RECUSADA"
                      ? "rgba(255,69,69,0.2)"
                      : "#2a2c2f",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <strong style={{ color: "#f0f0ee" }}>{p.User?.name}</strong>
                <span
                  style={{
                    fontSize: 12,
                    color:
                      p.status === "ACEITO"
                        ? "#3affb0"
                        : p.status === "RECUSADA"
                          ? "#ff4545"
                          : "#ffc940",
                  }}
                >
                  {p.status}
                </span>
              </div>
              <p
                style={{
                  color: "#e8ff3a",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                }}
              >
                {Number(p.cashOffer).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              {p.message && (
                <p
                  style={{
                    color: "#888",
                    fontSize: 13,
                    fontStyle: "italic",
                    marginTop: 6,
                  }}
                >
                  "{p.message}"
                </p>
              )}
              {p.status === "PENDENTE" && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    style={s.btnGreen}
                    onClick={() => handleStatus(p.id, "ACEITO")}
                  >
                    ✓ Aceitar
                  </button>
                  <button
                    style={s.btnRed}
                    onClick={() => handleStatus(p.id, "RECUSADA")}
                  >
                    ✗ Recusar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0c0d0f" },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "calc(100vh - 64px)",
    color: "#888",
  },
  layout: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "2rem",
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: "2rem",
  },
  imgMain: {
    position: "relative",
    background: "#1e2022",
    borderRadius: 16,
    overflow: "hidden",
    aspectRatio: "16/9",
  },
  noImg: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
  },
  navRow: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(0,0,0,0.7)",
    padding: "4px 14px",
    borderRadius: 20,
  },
  navBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "1.3rem",
    cursor: "pointer",
  },
  name: { fontWeight: 800, fontSize: "1.8rem", color: "#f0f0ee" },
  price: { fontWeight: 800, fontSize: "1.5rem", color: "#e8ff3a" },
  specs: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  spec: {
    background: "#1e2022",
    padding: "10px 14px",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  specLabel: { fontSize: 11, color: "#555", textTransform: "uppercase" },
  specVal: { fontSize: 14, color: "#f0f0ee" },
  sectionLabel: {
    fontSize: 11,
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
  },
  tag: {
    background: "#1e2022",
    border: "1px solid #2a2c2f",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    color: "#888",
  },
  seller: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#1e2022",
    padding: "12px 16px",
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#e8ff3a",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 16,
  },
  btn: {
    background: "#e8ff3a",
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 15,
  },
  btnOutline: {
    background: "none",
    border: "1px solid #2a2c2f",
    color: "#888",
    borderRadius: 8,
    padding: "12px",
    cursor: "pointer",
  },
  btnGreen: {
    background: "rgba(58,255,176,0.15)",
    color: "#3affb0",
    border: "1px solid #3affb0",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  btnRed: {
    background: "rgba(255,69,69,0.15)",
    color: "#ff4545",
    border: "1px solid #ff4545",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  propForm: {
    background: "#1e2022",
    border: "1px solid rgba(232,255,58,0.15)",
    borderRadius: 12,
    padding: "1.2rem",
  },
  propSection: { maxWidth: 1100, margin: "0 auto", padding: "0 2rem 4rem" },
  propCard: {
    background: "#161719",
    border: "1px solid",
    borderRadius: 12,
    padding: "1rem 1.2rem",
    marginBottom: 10,
  },
  input: {
    background: "#0c0d0f",
    border: "1px solid #2a2c2f",
    color: "#f0f0ee",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    outline: "none",
    width: "100%",
    marginTop: 4,
  },
  label: { fontSize: 12, color: "#888" },
  error: {
    background: "rgba(255,69,69,0.12)",
    border: "1px solid rgba(255,69,69,0.3)",
    color: "#ff4545",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 8,
  },
  success: {
    background: "rgba(58,255,176,0.1)",
    border: "1px solid rgba(58,255,176,0.3)",
    color: "#3affb0",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 8,
  },
};
