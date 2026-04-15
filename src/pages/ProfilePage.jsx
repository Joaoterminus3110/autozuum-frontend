import { useState, useEffect, useContext } from "react";
import {
  getUserById,
  getReviewsByUser,
  getVehicles,
  createReview,
  updateUser,
} from "../servicos/api";
import VehicleCard from "../components/VehicleCard";
import "./ProfilePage.css";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID do perfil que estamos visitando
  const { currentUser } = useContext(AuthContext); // Usuário que está logado

  // 1. Define quem é o dono deste perfil (Prioridade para o ID da URL)
  const targetId = id || currentUser?.id;

  // 2. Checagem única se o perfil é meu (usando String para evitar erro de tipo)
  const isSelf = currentUser && String(currentUser.id) === String(targetId);

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tab, setTab] = useState("vehicles");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "" });

  // States de Avaliação...
  const [revForm, setRevForm] = useState({ rating: 5, comment: "" });
  const [revError, setRevError] = useState("");
  const [revSuccess, setRevSuccess] = useState("");

  useEffect(() => {
    if (!targetId) {
      navigate("/login"); // Se não tem ID e não tá logado, tchau!
      return;
    }

    setLoading(true);

    Promise.all([
      getUserById(targetId),
      getReviewsByUser(targetId),
      getVehicles(), // Aqui pegamos todos...
    ])
      .then(([u, r, v]) => {
        setUser(u);
        setReviews(Array.isArray(r) ? r : []);

        // 3. FILTRAGEM: Só mostra os veículos onde o dono é o cara do perfil
        const allVehicles = v && Array.isArray(v.vehicles) ? v.vehicles : v;
        const filtered = allVehicles.filter(
          (veh) => String(veh.userId) === String(targetId),
        );
        setVehicles(filtered);

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
  }, [targetId, navigate]);

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleReview = async (e) => {
    e.preventDefault();
    setRevError("");
    setRevSuccess("");

    const res = await createReview({
      reviewerId: currentUser.id,
      reviewedId: targetId,
      rating: Number(revForm.rating),
      comment: revForm.comment,
    });

    if (res.error) {
      setRevError(res.error);
      return;
    }

    setRevSuccess("Avaliação enviada!");
    setReviews((prev) => [
      ...prev,
      { ...res.review, reviewer: { name: currentUser.name } },
    ]);
  };

  const handleSave = async () => {
    await updateUser(targetId, editForm);
    setUser({ ...user, ...editForm });
    setEditing(false);
  };

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

          {tab === "reviews" && (
            <div>
              {reviews.length === 0 && (
                <div className="profile-empty">⭐ Sem avaliações ainda.</div>
              )}

              {reviews.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-header">
                    <div className="avatar-sm">
                      {r.reviewer?.name?.[0]?.toUpperCase()}
                    </div>

                    <strong className="reviewer-name">
                      {r.reviewer?.name}
                    </strong>

                    <span className="review-stars">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </div>

                  {r.comment && <p className="review-comment">{r.comment}</p>}
                </div>
              ))}

              {currentUser && !isSelf && (
                <form onSubmit={handleReview} className="review-form">
                  <h4 className="review-form-title">Deixar Avaliação</h4>

                  {revError && <div className="msg-error">{revError}</div>}
                  {revSuccess && (
                    <div className="msg-success">{revSuccess}</div>
                  )}

                  <label className="profile-label">Nota</label>

                  <div className="rating-actions">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRevForm({ ...revForm, rating: n })}
                        className={`star-btn ${n <= revForm.rating ? "star-btn-active" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <label className="profile-label">Comentário</label>

                  <textarea
                    className="profile-input profile-textarea"
                    rows={3}
                    placeholder="Como foi negociar?"
                    value={revForm.comment}
                    onChange={(e) =>
                      setRevForm({ ...revForm, comment: e.target.value })
                    }
                  />

                  <button type="submit" className="btn">
                    Enviar Avaliação
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
