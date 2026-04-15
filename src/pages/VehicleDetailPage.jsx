import { useState, useEffect, useContext } from "react";
import {
  getVehicleById,
  createProposal,
  getProposalsByVehicle,
  updateProposalStatus,
  getVehicles,
  getImageUrl,
} from "../servicos/api";
import "./VehicleDetailPage.css";
import { useParams } from "react-router-dom";
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
  const [form, setForm] = useState({
    cashOffer: "",
    message: "",
    offeredVehicleId: "",
  });
  const [propError, setPropError] = useState("");
  const [propSuccess, setPropSuccess] = useState("");

  const isLoggedIn = !!currentUser;
  const isOwner =
    currentUser && vehicle && String(currentUser.id) === String(vehicle.userId);

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
    await updateProposalStatus(id, status);
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
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
            {images.length > 0 ? (
              <img
                src={getImageUrl(images[imgIndex].url)}
                alt=""
                className="vehicle-detail-main-image"
              />
            ) : (
              <div className="vehicle-detail-no-img">Sem fotos</div>
            )}

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
                  alt=""
                  onClick={() => setImgIndex(i)}
                  className={`vehicle-detail-thumb ${
                    i === imgIndex ? "vehicle-detail-thumb-active" : ""
                  }`}
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
              {vehicle.User?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <strong className="vehicle-detail-seller-name">
                {vehicle.User?.name}
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

      {isOwner && proposals.length > 0 && (
        <div className="vehicle-detail-prop-section">
          <h3 className="vehicle-detail-prop-heading">
            Propostas Recebidas ({proposals.length})
          </h3>

          {proposals.map((p) => (
            <div
              key={p.id}
              className={`vehicle-detail-prop-card ${
                p.status === "ACEITO"
                  ? "vehicle-detail-prop-card-accepted"
                  : p.status === "RECUSADA"
                    ? "vehicle-detail-prop-card-rejected"
                    : ""
              }`}
            >
              <div className="vehicle-detail-prop-top">
                <strong className="vehicle-detail-prop-user">
                  {p.User?.name}
                </strong>
                <span
                  className={`vehicle-detail-prop-status ${
                    p.status === "ACEITO"
                      ? "status-accepted"
                      : p.status === "RECUSADA"
                        ? "status-rejected"
                        : "status-pending"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <p className="vehicle-detail-prop-price">
                {Number(p.cashOffer).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>

              {p.message && (
                <p className="vehicle-detail-prop-message">"{p.message}"</p>
              )}

              {p.status === "PENDENTE" && (
                <div className="vehicle-detail-prop-actions">
                  <button
                    className="vehicle-detail-btn-green"
                    onClick={() => handleStatus(p.id, "ACEITO")}
                  >
                    ✓ Aceitar
                  </button>
                  <button
                    className="vehicle-detail-btn-red"
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
