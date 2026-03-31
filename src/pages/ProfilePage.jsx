import { useState, useEffect } from "react";
import { getUserById, getReviewsByUser, getVehicles, createReview, updateUser } from "../servicos/api";
import Navbar from "../components/Navbar";
import VehicleCard from "../components/VehicleCard";

export default function ProfilePage({ onNavigate, currentUser, userId }) {
  const targetId = userId || currentUser?.id;
  const isSelf = currentUser?.id === targetId;
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tab, setTab] = useState("vehicles");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [revForm, setRevForm] = useState({ rating: 5, comment: "" });
  const [revError, setRevError] = useState("");
  const [revSuccess, setRevSuccess] = useState("");

  useEffect(() => {
    if (!targetId) return;
    Promise.all([getUserById(targetId), getReviewsByUser(targetId), getVehicles()]).then(([u, r, v]) => {
      setUser(u); setReviews(Array.isArray(r) ? r : []);
      setVehicles(Array.isArray(v) ? v.filter((x) => x.userId === targetId) : []);
      setEditForm({ name: u.name, phone: u.phone, email: u.email });
      setLoading(false);
    });
  }, [targetId]);

  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleReview = async (e) => {
    e.preventDefault(); setRevError(""); setRevSuccess("");
    const res = await createReview({ reviewerId: currentUser.id, reviewedId: targetId, rating: Number(revForm.rating), comment: revForm.comment });
    if (res.error) { setRevError(res.error); return; }
    setRevSuccess("Avaliação enviada!");
    setReviews((prev) => [...prev, { ...res.review, reviewer: { name: currentUser.name } }]);
  };

  const handleSave = async () => {
    await updateUser(targetId, editForm);
    setUser({ ...user, ...editForm }); setEditing(false);
  };

  if (loading) return <div style={s.page}><Navbar onNavigate={onNavigate} currentUser={currentUser} /><div style={s.center}>Carregando...</div></div>;

  return (
    <div style={s.page}>
      <Navbar onNavigate={onNavigate} currentUser={currentUser} />
      <div style={s.layout}>

        {/* Sidebar */}
        <aside style={s.sidebar}>
          <div style={s.avatarLg}>{user?.name?.[0]?.toUpperCase()}</div>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              <input style={s.input} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Nome" />
              <input style={s.input} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Telefone" />
              <input style={s.input} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="E-mail" />
              <button style={s.btn} onClick={handleSave}>Salvar</button>
              <button style={s.btnOutline} onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          ) : (
            <>
              <h2 style={s.name}>{user?.name}</h2>
              <p style={s.sub}>{user?.email}</p>
              <p style={s.sub}>{user?.phone}</p>
              {avg && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#ffc940", fontSize: "1.2rem" }}>{"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}</div>
                  <p style={{ color: "#888", fontSize: 12 }}>{avg} ({reviews.length} avaliações)</p>
                </div>
              )}
              {isSelf && <button style={s.btnOutline} onClick={() => setEditing(true)}>✏️ Editar Perfil</button>}
            </>
          )}
        </aside>

        {/* Main */}
        <div>
          <div style={s.tabs}>
            <button style={{ ...s.tab, ...(tab === "vehicles" ? s.tabActive : {}) }} onClick={() => setTab("vehicles")}>Anúncios ({vehicles.length})</button>
            <button style={{ ...s.tab, ...(tab === "reviews" ? s.tabActive : {}) }} onClick={() => setTab("reviews")}>Avaliações ({reviews.length})</button>
          </div>

          {tab === "vehicles" && (
            vehicles.length === 0
              ? <div style={s.empty}>🚗 Nenhum anúncio ainda.{isSelf && <button style={{ ...s.btn, marginTop: 12 }} onClick={() => onNavigate("new-vehicle")}>Anunciar agora</button>}</div>
              : <div style={s.grid}>{vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} onClick={() => onNavigate("vehicle-detail", { vehicleId: v.id })} />)}</div>
          )}

          {tab === "reviews" && (
            <div>
              {reviews.length === 0 && <div style={s.empty}>⭐ Sem avaliações ainda.</div>}
              {reviews.map((r, i) => (
                <div key={i} style={s.reviewCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={s.avatarSm}>{r.reviewer?.name?.[0]?.toUpperCase()}</div>
                    <strong style={{ color: "#f0f0ee" }}>{r.reviewer?.name}</strong>
                    <span style={{ marginLeft: "auto", color: "#ffc940" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ color: "#888", fontSize: 13 }}>{r.comment}</p>}
                </div>
              ))}

              {currentUser && !isSelf && (
                <form onSubmit={handleReview} style={s.revForm}>
                  <h4 style={{ color: "#f0f0ee", marginBottom: 12 }}>Deixar Avaliação</h4>
                  {revError && <div style={s.error}>{revError}</div>}
                  {revSuccess && <div style={s.success}>{revSuccess}</div>}
                  <label style={s.label}>Nota</label>
                  <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRevForm({ ...revForm, rating: n })}
                        style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: n <= revForm.rating ? "#ffc940" : "#333" }}>★</button>
                    ))}
                  </div>
                  <label style={s.label}>Comentário</label>
                  <textarea style={{ ...s.input, resize: "vertical", marginBottom: 12 }} rows={3} placeholder="Como foi negociar?" value={revForm.comment} onChange={(e) => setRevForm({ ...revForm, comment: e.target.value })} />
                  <button type="submit" style={s.btn}>Enviar Avaliação</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0c0d0f" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 64px)", color: "#888" },
  layout: { maxWidth: 1100, margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "260px 1fr", gap: "2rem" },
  sidebar: { background: "#161719", border: "1px solid #2a2c2f", borderRadius: 16, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, height: "fit-content" },
  avatarLg: { width: 80, height: 80, borderRadius: "50%", background: "#044040", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 30 },
  avatarSm: { width: 30, height: 30, borderRadius: "50%", background: "#044040", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 },
  name: { fontWeight: 800, fontSize: "1.2rem", color: "#f0f0ee", textAlign: "center" },
  sub: { fontSize: 13, color: "#888", textAlign: "center" },
  tabs: { display: "flex", gap: 4, borderBottom: "1px solid #2a2c2f", marginBottom: "1.5rem" },
  tab: { background: "none", border: "none", color: "#888", padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, borderBottom: "2px solid transparent", marginBottom: -1 },
  tabActive: { color: "#044040", borderBottomColor: "#5bff3a" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem", color: "#888" },
  reviewCard: { background: "#161719", border: "1px solid #2a2c2f", borderRadius: 10, padding: "12px 16px", marginBottom: 10 },
  revForm: { background: "#161719", border: "1px solid #2a2c2f", borderRadius: 12, padding: "1.2rem", marginTop: 16 },
  input: { background: "#1e2022", border: "1px solid #2a2c2f", color: "#f0f0ee", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", width: "100%" },
  label: { fontSize: 12, color: "#888", display: "block", marginBottom: 4 },
  btn: { background: "#e8ff3a", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 800, cursor: "pointer", width: "100%" },
  btnOutline: { background: "none", border: "1px solid #2a2c2f", color: "#888", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, width: "100%" },
  error: { background: "rgba(255,69,69,0.12)", border: "1px solid rgba(255,69,69,0.3)", color: "#ff4545", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 8 },
  success: { background: "rgba(58,255,176,0.1)", border: "1px solid rgba(58,255,176,0.3)", color: "#3affb0", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 8 },
};