import { useState, useEffect, useContext } from "react";
import api, {
  getUserById,
  getReviewsByUser,
  updateUser,
  getProposalsByVehicle,
  getImageUrl,
} from "../servicos/api";
import VehicleCard from "../components/VehicleCard";
import "./ProfilePage.css";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);

  const targetId = id || currentUser?.id;
  const isSelf = currentUser && String(currentUser.id) === String(targetId);

  // Estados principais
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [soldVehicles, setSoldVehicles] = useState([]);
  const [boughtVehicles, setBoughtVehicles] = useState([]);
  const [pendingProposals, setPendingProposals] = useState([]);

  // Estados de layout e edição
  const [tab, setTab] = useState("vehicles");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "" });

  // Estados do Modal de Avaliação e Toast (Notificação)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [targetReviewUser, setTargetReviewUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Recupera as avaliações já feitas no navegador para esconder os botões
  const [evaluations, setEvaluations] = useState(() => {
    const saved = localStorage.getItem("autozoom_evals");
    return saved ? JSON.parse(saved) : {};
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500); // Some após 3.5 segundos
  };

  useEffect(() => {
    if (!targetId) {
      navigate("/login");
      return;
    }

    setLoading(true);

    Promise.all([
      getUserById(targetId),
      getReviewsByUser(targetId),
      api.get("/vehicles?includeSold=true").then((res) => res.data),
    ])
      .then(async ([u, r, v]) => {
        setUser(u);
        setReviews(Array.isArray(r) ? r : []);

        const allVehicles =
          v && Array.isArray(v.vehicles)
            ? v.vehicles
            : Array.isArray(v)
              ? v
              : [];

        const userVehicles = allVehicles.filter(
          (veh) => String(veh.userId) === String(targetId),
        );
        const active = userVehicles.filter((veh) => veh.status !== "sold");
        const sold = userVehicles.filter((veh) => veh.status === "sold");

        const bought = allVehicles.filter(
          (veh) =>
            String(veh.buyerId) === String(targetId) && veh.status === "sold",
        );

        setVehicles(active);
        setSoldVehicles(sold);
        setBoughtVehicles(bought);

        if (isSelf) {
          try {
            const proposalsPromises = active.map((veh) =>
              getProposalsByVehicle(veh.id)
                .then((res) => {
                  const props = Array.isArray(res) ? res : [];
                  return props.map((p) => ({ ...p, targetVehicle: veh }));
                })
                .catch(() => []),
            );

            const allProposalsArrays = await Promise.all(proposalsPromises);
            const allProposals = allProposalsArrays.flat();

            const pending = allProposals.filter((p) => p.status === "PENDING");
            setPendingProposals(pending);
          } catch (error) {
            console.error("Erro ao buscar propostas pendentes:", error);
          }
        }

        setEditForm({
          name: u.name || "",
          phone: u.phone || "",
          email: u.email || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        navigate("/");
      });
  }, [targetId, navigate, isSelf]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reviews", {
        reviewedId: targetReviewUser.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      // Salva a nota no LocalStorage vinculada ao ID do carro
      const newEvals = {
        ...evaluations,
        [targetReviewUser.vehicleId]: reviewForm.rating,
      };
      setEvaluations(newEvals);
      localStorage.setItem("autozoom_evals", JSON.stringify(newEvals));

      showToast("Avaliação enviada com sucesso!", "success");
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: "" });
    } catch (error) {
      const errMsg = error.response?.data?.error || "Erro ao enviar avaliação.";

      // Se a API disser que já avaliou, escondemos o botão por garantia
      if (errMsg.toLowerCase().includes("já avaliou")) {
        const newEvals = {
          ...evaluations,
          [targetReviewUser.vehicleId]: reviewForm.rating,
        };
        setEvaluations(newEvals);
        localStorage.setItem("autozoom_evals", JSON.stringify(newEvals));
      }

      showToast(errMsg, "error");
      setShowReviewModal(false);
    }
  };

  const handleSave = async () => {
    await updateUser(targetId, editForm);
    setUser({ ...user, ...editForm });
    setEditing(false);
  };

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="avatar-lg">{user?.name?.[0]?.toUpperCase()}</div>

          {editing ? (
            <div className="edit-form">
              <input
                className="profile-input"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Nome"
              />
              <input
                className="profile-input"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="Telefone"
              />
              <input
                className="profile-input"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="E-mail"
              />
              <button className="btn" onClick={handleSave}>
                Salvar
              </button>
              <button className="btn-outline" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-sub">{user?.email}</p>
              <p className="profile-sub">{user?.phone}</p>

              {avg && (
                <div className="profile-rating-box">
                  <div className="profile-stars">
                    {"★".repeat(Math.round(avg))}
                    {"☆".repeat(5 - Math.round(avg))}
                  </div>
                  <p className="profile-rating-text">
                    {avg} ({reviews.length} avaliações)
                  </p>
                </div>
              )}

              {isSelf && (
                <button
                  className="btn-outline"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Editar Perfil
                </button>
              )}
            </>
          )}
        </aside>

        <div>
          <div className="profile-tabs">
            <button
              className={`profile-tab ${tab === "vehicles" ? "profile-tab-active" : ""}`}
              onClick={() => setTab("vehicles")}
            >
              Anúncios ({vehicles.length})
            </button>

            {isSelf && (
              <button
                className={`profile-tab ${tab === "proposals" ? "profile-tab-active" : ""}`}
                onClick={() => setTab("proposals")}
              >
                Novas Propostas ({pendingProposals.length})
              </button>
            )}

            {isSelf && (
              <button
                className={`profile-tab ${tab === "sold" ? "profile-tab-active" : ""}`}
                onClick={() => setTab("sold")}
              >
                Vendidos ({soldVehicles.length})
              </button>
            )}

            {isSelf && (
              <button
                className={`profile-tab ${tab === "bought" ? "profile-tab-active" : ""}`}
                onClick={() => setTab("bought")}
              >
                Minhas Compras ({boughtVehicles.length})
              </button>
            )}

            <button
              className={`profile-tab ${tab === "reviews" ? "profile-tab-active" : ""}`}
              onClick={() => setTab("reviews")}
            >
              Avaliações ({reviews.length})
            </button>
          </div>

          {tab === "vehicles" &&
            (vehicles.length === 0 ? (
              <div className="profile-empty">
                🚗 Nenhum anúncio ainda.
                {isSelf && (
                  <button
                    className="btn profile-empty-btn"
                    onClick={() => navigate("/anunciar")}
                  >
                    Anunciar agora
                  </button>
                )}
              </div>
            ) : (
              <div className="profile-grid">
                {vehicles.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    onClick={() => navigate(`/veiculo/${v.id}`)}
                  />
                ))}
              </div>
            ))}

          {tab === "proposals" && isSelf && (
            <div>
              {pendingProposals.length === 0 ? (
                <div className="profile-empty">
                  Nenhuma proposta pendente no momento.
                </div>
              ) : (
                pendingProposals.map((p) => (
                  <div key={p.id} className="perfil-proposal-card">
                    <div className="perfil-prop-action">
                      <Link
                        to={`/proposta/${p.id}`}
                        className="perfil-btn-circle"
                      >
                        Ver
                        <br />
                        Proposta
                      </Link>
                    </div>
                    <div className="perfil-prop-info">
                      <h3>
                        Veículo: {p.targetVehicle?.brand}{" "}
                        {p.targetVehicle?.model}
                      </h3>
                      <p>
                        <strong>Valor Ofertado:</strong>{" "}
                        {Number(p.cashOffer).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}{" "}
                        {p.offeredVehicleId ? " + 1 veículo" : ""}
                      </p>
                      <p>
                        <strong>Mensagem:</strong> {p.message || "Sem mensagem"}
                      </p>
                      <p className="perfil-prop-owner">
                        Dono da Oferta:{" "}
                        {p.buyer?.name?.split(" ")[0] || "Comprador"}
                      </p>
                    </div>
                    <div className="perfil-prop-image-box">
                      <img
                        src={
                          p.targetVehicle?.images?.[0]?.url
                            ? getImageUrl(p.targetVehicle.images[0].url)
                            : "/fallback-autozoom.png"
                        }
                        alt="Veículo"
                        className="perfil-prop-image"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "sold" && isSelf && (
            <div>
              {soldVehicles.length === 0 ? (
                <div className="profile-empty">
                  Você ainda não concluiu nenhuma venda.
                </div>
              ) : (
                soldVehicles.map((v) => (
                  <div
                    key={v.id}
                    className="perfil-proposal-card perfil-sold-card"
                  >
                    <div className="perfil-prop-info">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <h3>
                          {v.brand} {v.model}
                        </h3>
                        <span className="sold-badge">VENDIDO</span>
                      </div>
                      <p>
                        <strong>Motor:</strong> {v.engine}
                      </p>
                      <p>
                        <strong>Data da Venda:</strong>{" "}
                        {new Date(v.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="perfil-prop-owner">
                        Comprador:{" "}
                        {v.Buyer?.name || "Vendido em outra plataforma"}
                      </p>
                    </div>
                    <div className="perfil-prop-image-box">
                      <img
                        src={
                          v.images?.[0]?.url
                            ? getImageUrl(v.images[0].url)
                            : "/fallback-autozoom.png"
                        }
                        alt="Veículo Vendido"
                        className="perfil-prop-image"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "bought" && isSelf && (
            <div>
              {boughtVehicles.length === 0 ? (
                <div className="profile-empty">
                  Você ainda não comprou nenhum veículo na plataforma.
                </div>
              ) : (
                boughtVehicles.map((v) => (
                  <div
                    key={v.id}
                    className="perfil-proposal-card perfil-sold-card"
                  >
                    <div className="perfil-prop-info">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <h3>
                          {v.brand} {v.model}
                        </h3>
                        <span
                          className="sold-badge"
                          style={{ backgroundColor: "#2980b9" }}
                        >
                          COMPRADO
                        </span>
                      </div>
                      <p>
                        <strong>Motor:</strong> {v.engine}
                      </p>
                      <p>
                        <strong>Data da Compra:</strong>{" "}
                        {new Date(v.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="perfil-prop-owner">
                        Vendedor: {v.user?.name || "Vendedor"}
                      </p>
                    </div>
                    <div className="perfil-prop-image-box">
                      <img
                        src={
                          v.images?.[0]?.url
                            ? getImageUrl(v.images[0].url)
                            : "/fallback-autozoom.png"
                        }
                        alt="Veículo Comprado"
                        className="perfil-prop-image"
                      />

                      {/* Verifica se o veículo já foi avaliado */}
                      {evaluations[v.id] ? (
                        <div className="evaluated-container">
                          <span className="evaluated-text">Sua Avaliação:</span>
                          <div className="evaluated-stars">
                            {"⭐".repeat(evaluations[v.id])}
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn-avaliar"
                          onClick={() => {
                            setTargetReviewUser({
                              id: v.userId,
                              name: v.user?.name || "Vendedor",
                              vehicleId: v.id,
                            });
                            setShowReviewModal(true);
                          }}
                        >
                          Avaliar Vendedor
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div>
              {reviews.length === 0 ? (
                <div className="profile-empty">
                  ⭐ Nenhuma avaliação recebida ainda.
                </div>
              ) : (
                <div className="perfil-reviews-grid">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="perfil-review-card">
                      <div className="review-header">
                        <span className="stars">
                          {"⭐".repeat(rev.rating)}
                          {"☆".repeat(5 - rev.rating)}
                        </span>
                        <span className="review-date">
                          {new Date(rev.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <p className="review-comment">"{rev.comment}"</p>
                      <div className="review-author">
                        <span>
                          Avaliado por:{" "}
                          <strong>
                            {rev.reviewer?.name ||
                              rev.Reviewer?.name ||
                              "Usuário"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content review-modal">
            <h2>Avaliar {targetReviewUser?.name}</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Nota (1 a 5 Estrelas)</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      rating: Number(e.target.value),
                    })
                  }
                  required
                >
                  <option value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
                  <option value="4">⭐⭐⭐⭐ (Muito Bom)</option>
                  <option value="3">⭐⭐⭐ (Bom)</option>
                  <option value="2">⭐⭐ (Ruim)</option>
                  <option value="1">⭐ (Péssimo)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Seu Comentário</label>
                <textarea
                  rows="4"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  placeholder="Como foi a negociação?..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm">
                  Enviar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION FLUTUANTE */}
      {toast && (
        <div
          className={`toast-notification ${toast.type === "error" ? "toast-error" : ""}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
