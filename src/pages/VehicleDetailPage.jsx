import { useState, useEffect, useContext } from "react";
import api, {
  getVehicleById,
  createProposal,
  getProposalsByVehicle,
  updateProposalStatus,
  getVehicles,
  getImageUrl,
  // <-- Certifique-se de que a instância do axios (api) está sendo exportada do seu servicos/api
} from "../servicos/api";
import "./VehicleDetailPage.css";
import { useParams, Link } from "react-router-dom"; // <-- Link adicionado
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function VehicleDetailPage() {
  const { id } = useParams();
  const vehicleId = id;
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedBuyer, setSelectedBuyer] = useState(""); // <-- Novo state para a venda
  const [form, setForm] = useState({
    cashOffer: "",
    message: "",
    offeredVehicleId: "",
  });
  const [propError, setPropError] = useState("");
  const [propSuccess, setPropSuccess] = useState("");

  const isOwner =
    currentUser && vehicle && String(currentUser.id) === String(vehicle.userId);

  useEffect(() => {
    getVehicleById(vehicleId).then((v) => {
      setVehicle(v);
      setLoading(false);
    });
  }, [vehicleId]);

  useEffect(() => {
    if (isOwner)
      getProposalsByVehicle(vehicleId)
        .then((res) => {
          setProposals(Array.isArray(res) ? res : []);
        })
        .catch(console.error); // Silencia erro no console se não houver propostas
  }, [isOwner, vehicleId]);

  useEffect(() => {
    if (currentUser && showForm) {
      getVehicles().then((res) => {
        const vehiclesArray =
          res && Array.isArray(res.vehicles)
            ? res.vehicles
            : Array.isArray(res)
              ? res
              : [];

        setMyVehicles(
          vehiclesArray.filter(
            (v) =>
              String(v.userId) === String(currentUser.id) &&
              String(v.id) !== String(vehicleId),
          ),
        );
      });
    }
  }, [currentUser, showForm, vehicleId]);

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
    try {
      await updateProposalStatus(id, status);
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
    } catch (error) {
      alert(
        "Erro ao atualizar status: " +
          (error.response?.data?.error || "Verifique a conexão."),
      );
    }
  };

  if (loading) {
    return (
      <div className="vehicle-detail-page">
        <div className="vehicle-detail-center">Carregando...</div>
      </div>
    );
  }

  if (!vehicle || vehicle.error) {
    return (
      <div className="vehicle-detail-page">
        <div className="vehicle-detail-center">Veículo não encontrado.</div>
      </div>
    );
  }

  const images = vehicle.images || [];
  const price = Number(vehicle.price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="vehicle-detail-page">
      <div className="vehicle-detail-layout">
        <div>
          <div className="vehicle-detail-img-main">
            <img
              src={
                images.length > 0
                  ? getImageUrl(images[imgIndex].url)
                  : "/fallback-autozoom.png"
              }
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="vehicle-detail-main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/fallback-autozoom.png";
              }}
            />

            {images.length > 1 && (
              <div className="vehicle-detail-nav-row">
                <button
                  className="vehicle-detail-nav-btn"
                  onClick={() =>
                    setImgIndex((i) => (i - 1 + images.length) % images.length)
                  }
                >
                  ‹
                </button>

                <span className="vehicle-detail-counter">
                  {imgIndex + 1}/{images.length}
                </span>

                <button
                  className="vehicle-detail-nav-btn"
                  onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="vehicle-detail-thumbs">
              {images.map((img, i) => (
                <img
                  key={img.id}
                  src={getImageUrl(img.url)}
                  alt={`Foto ${i + 1} de ${vehicle.model}`}
                  onClick={() => setImgIndex(i)}
                  className={`vehicle-detail-thumb ${
                    i === imgIndex ? "vehicle-detail-thumb-active" : ""
                  }`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/fallback-autozoom.png";
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="vehicle-detail-info">
          <div className="vehicle-detail-header">
            <div>
              <h1 className="vehicle-detail-name">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="vehicle-detail-year">
                {vehicle.manufactureYear}/{vehicle.modelYear}
              </p>
            </div>

            <span className="vehicle-detail-price">{price}</span>
          </div>

          <div className="vehicle-detail-specs">
            {[
              ["Motor", vehicle.engine],
              ["Câmbio", vehicle.transmission],
              ["KM", vehicle.mileage?.toLocaleString("pt-BR")],
              ["Local", vehicle.location],
            ].map(([k, v]) => (
              <div key={k} className="vehicle-detail-spec">
                <span className="vehicle-detail-spec-label">{k}</span>
                <strong className="vehicle-detail-spec-val">{v}</strong>
              </div>
            ))}
          </div>

          {vehicle.features?.length > 0 && (
            <div>
              <p className="vehicle-detail-section-label">Opcionais</p>
              <div className="vehicle-detail-tags">
                {vehicle.features.map((f) => (
                  <span key={f} className="vehicle-detail-tag">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="vehicle-detail-section-label">Descrição</p>
            <p className="vehicle-detail-description">{vehicle.description}</p>
          </div>

          <div className="vehicle-detail-seller">
            <div className="vehicle-detail-avatar">
              {vehicle.User?.name?.[0]?.toUpperCase() || "V"}
            </div>
            <div>
              <strong className="vehicle-detail-seller-name">
                {vehicle.User?.name || "Vendedor"}
              </strong>
              <p className="vehicle-detail-seller-email">
                {vehicle.User?.email}
              </p>
            </div>
          </div>

          {!currentUser && (
            <button
              className="vehicle-detail-btn"
              onClick={() => navigate("/login")}
            >
              Entre para fazer proposta
            </button>
          )}

          {currentUser && !isOwner && (
            <button
              className="vehicle-detail-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancelar" : "Fazer Proposta"}
            </button>
          )}

          {isOwner && (
            <button
              className="vehicle-detail-btn-outline"
              onClick={() => navigate(`/editar-veiculo/${vehicleId}`)}
            >
              Editar Anúncio
            </button>
          )}

          {showForm && (
            <div className="vehicle-detail-prop-form">
              <h4 className="vehicle-detail-form-title">Sua Proposta</h4>

              {propError && (
                <div className="vehicle-detail-error">{propError}</div>
              )}
              {propSuccess && (
                <div className="vehicle-detail-success">{propSuccess}</div>
              )}

              <form
                onSubmit={handleProposal}
                className="vehicle-detail-form-fields"
              >
                <div>
                  <label className="vehicle-detail-label">Valor (R$)</label>
                  <input
                    className="vehicle-detail-input"
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
                    <label className="vehicle-detail-label">
                      Oferecer na troca (opcional)
                    </label>
                    <select
                      className="vehicle-detail-input"
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
                  <label className="vehicle-detail-label">Mensagem</label>
                  <textarea
                    className="vehicle-detail-input vehicle-detail-textarea"
                    rows={3}
                    placeholder="Pago à vista se fechar hoje!"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />
                </div>

                <button type="submit" className="vehicle-detail-btn">
                  Enviar Proposta
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="vehicle-detail-prop-section">
          {/* ======================================================== */}
          {/* BLOCO DE FINALIZAR VENDA SUBSTITUINDO A LISTA DE PROPOSTAS */}
          {/* ======================================================== */}
          <div
            style={{
              backgroundColor: "#161719",
              border: "1px solid #2a2c2f",
              padding: "20px",
              borderRadius: "12px",
              marginTop: "10px",
            }}
          >
            <h3
              style={{
                color: "#f0f0ee",
                borderBottom: "1px solid #2a2c2f",
                paddingBottom: "15px",
                marginBottom: "15px",
              }}
            >
              Finalizar Venda do Veículo
            </h3>

            <div>
              <label
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                Selecione o Comprador:
              </label>

              <select
                value={selectedBuyer}
                onChange={(e) => setSelectedBuyer(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#1e2022",
                  color: "#f0f0ee",
                  border: "1px solid #2a2c2f",
                  marginBottom: "20px",
                  outline: "none",
                }}
              >
                <option value="">Selecione...</option>

                {/* Lista apenas quem teve a proposta ACEITA (status ACCEPTED) */}
                {proposals
                  .filter((p) => p.status === "ACCEPTED")
                  .map((p) => (
                    <option key={p.id} value={p.buyerId}>
                      {p.buyer?.name || "Comprador"} (Proposta Aceita)
                    </option>
                  ))}

                <option value="OUTRA_PLATAFORMA">
                  Vendido em outra plataforma / Fora do site
                </option>
              </select>

              <button
                className="vehicle-detail-btn-green"
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "1rem",
                  opacity: selectedBuyer ? 1 : 0.5,
                  cursor: selectedBuyer ? "pointer" : "not-allowed",
                }}
                disabled={!selectedBuyer}
                onClick={async () => {
                  try {
                    // O payload: envia null se for fora do site, ou o ID do comprador
                    const payload =
                      selectedBuyer === "OUTRA_PLATAFORMA"
                        ? { buyerId: null }
                        : { buyerId: selectedBuyer };

                    await api.patch(`/vehicles/${vehicleId}/sell`, payload);
                    alert("Veículo marcado como vendido com sucesso!");
                    navigate("/perfil"); // Redireciona de forma limpa para o perfil
                  } catch (error) {
                    alert(
                      "Erro ao finalizar venda: " +
                        (error.response?.data?.error ||
                          "Verifique sua conexão."),
                    );
                  }
                }}
              >
                Confirmar Venda e Encerrar Anúncio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
