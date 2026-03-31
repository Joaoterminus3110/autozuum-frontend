import { useState, useEffect } from "react";
import { getVehicles } from "../servicos/api";
import VehicleCard from "../components/VehicleCard";
import Navbar from "../components/Navbar";

const formatMileage = (v) => Number(v).toLocaleString("pt-BR") + " km";

function HeroBanner({ onNavigate, currentUser }) {
  return (
    <section style={s.hero}>
      <div style={s.heroBg}>
        <div style={{ ...s.circle, width: 500, height: 500, background: "#7f0000", top: -100, left: -100 }} />
        <div style={{ ...s.circle, width: 400, height: 400, background: "#004d00", bottom: -120, right: -60 }} />
        <div style={s.grid} />
      </div>
      <div style={s.heroContent}>
        <h1 style={s.heroTitle}>
          O carro dos seus<br />
          <span style={{ color: "#fdfdfd" }}>sonhos está aqui.</span>
        </h1>
        <p style={s.heroSub}>
          Compre, venda e negocie veículos com segurança e transparência.
        </p>
        {!currentUser && (
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
            <button style={s.btnGreen} onClick={() => onNavigate("register")}>Criar Conta</button>
            <button style={s.btnOutline} onClick={() => onNavigate("login")}>Entrar</button>
          </div>
        )}
      </div>
    </section>
  );
}

function FilterBar({ filters, setFilters, onSearch }) {
  return (
    <div style={s.filterBar}>
      <input
        style={s.filterInput}
        placeholder="Marca ou modelo..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
      <input
        style={s.filterInput}
        placeholder="Cidade / Estado"
        value={filters.location}
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
      />
      <select
        style={s.filterInput}
        value={filters.transmission}
        onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
      >
        <option value="">Câmbio</option>
        <option value="Manual">Manual</option>
        <option value="Automático">Automático</option>
      </select>
      <select
        style={s.filterInput}
        value={filters.sort}
        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
      >
        <option value="">Ordenar por</option>
        <option value="price_asc">Menor preço</option>
        <option value="price_desc">Maior preço</option>
        <option value="mileage_asc">Menor KM</option>
        <option value="newest">Mais recentes</option>
      </select>
      <button style={s.btnGreen} onClick={onSearch}>Buscar</button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={s.skeleton}>
      <div style={s.skeletonImg} />
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ ...s.skeletonLine, width: "80%" }} />
        <div style={{ ...s.skeletonLine, width: "55%" }} />
        <div style={{ ...s.skeletonLine, width: "35%" }} />
      </div>
    </div>
  );
}

export default function Home({ onNavigate, currentUser }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: "", location: "", transmission: "", sort: "" });

  const fetchVehicles = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const filtered = vehicles
    .filter((v) => {
      const q = filters.search.toLowerCase();
      if (q && !v.brand.toLowerCase().includes(q) && !v.model.toLowerCase().includes(q)) return false;
      if (filters.location && !v.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.transmission && v.transmission !== filters.transmission) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "price_asc") return a.price - b.price;
      if (filters.sort === "price_desc") return b.price - a.price;
      if (filters.sort === "mileage_asc") return a.mileage - b.mileage;
      if (filters.sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div style={s.page}>
      <Navbar onNavigate={onNavigate} currentUser={currentUser} />
      <HeroBanner onNavigate={onNavigate} currentUser={currentUser} />

      <main style={s.main}>
        <FilterBar filters={filters} setFilters={setFilters} onSearch={fetchVehicles} />

        <div style={s.vitrineHeader}>
          <h2 style={s.vitrineTitle}>Veículos disponíveis</h2>
          {!loading && !error && (
            <span style={s.vitrineCount}>
              {filtered.length} anúncio{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
          {currentUser && (
            <button style={{ ...s.btnGreen, marginLeft: "auto" }} onClick={() => onNavigate("new-vehicle")}>
              + Anunciar Veículo
            </button>
          )}
        </div>

        {error && (
          <div style={s.stateError}>
            <span>⚠️</span>
            <p>{error}</p>
            <button style={s.btnOutline} onClick={fetchVehicles}>Tentar novamente</button>
          </div>
        )}

        {!error && (
          <div style={s.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.length === 0
              ? (
                <div style={s.stateEmpty}>
                  <span style={{ fontSize: "2.5rem" }}>🔍</span>
                  <p>Nenhum veículo encontrado com esses filtros.</p>
                </div>
              )
              : filtered.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    onClick={() => onNavigate("vehicle-detail", { vehicleId: v.id })}
                  />
                ))
            }
          </div>
        )}
      </main>

      <footer style={s.footer}>
        <span style={{ color: "#ff4545", fontWeight: 800 }}> AutoZumm</span>
        <span style={{ color: "#555", fontSize: 13 }}>© {new Date().getFullYear()} — Todos os direitos reservados</span>
      </footer>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0c0d0f", fontFamily: "'DM Sans', sans-serif" },

  // Hero
  hero: {
    position: "relative", overflow: "hidden",
    minHeight: "52vh", display: "flex", alignItems: "center", justifyContent: "center",
    padding: "8rem 2rem 4rem", textAlign: "center",
  },
  heroBg: { position: "absolute", inset: 0, pointerEvents: "none" },
  circle: { position: "absolute", borderRadius: "50%", filter: "blur(80px)", opacity: 0.2 },
  grid: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "50px 50px",
  },
  heroContent: { position: "relative", zIndex: 1, maxWidth: 680 },
  eyebrow: {
    display: "inline-block", marginBottom: "1rem",
    background: "#161719", border: "1px solid #2a2c2f",
    padding: "0.35rem 1rem", borderRadius: 999,
    fontSize: 13, color: "#888", letterSpacing: "0.04em",
  },
  heroTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: "clamp(2.4rem, 6vw, 4rem)",
    fontWeight: 800, lineHeight: 1.1, marginBottom: "1.25rem", color: "#f0f0ee",
  },
  heroSub: { color: "#888", fontSize: "1.05rem", lineHeight: 1.6 },

  // Filter
  filterBar: {
    display: "flex", flexWrap: "wrap", gap: 10,
    background: "#161719", border: "1px solid #2a2c2f",
    borderRadius: 16, padding: "1.25rem", marginBottom: "2.5rem",
  },
  filterInput: {
    flex: 1, minWidth: 160,
    background: "#1e2022", border: "1px solid #2a2c2f",
    borderRadius: 8, padding: "10px 14px",
    color: "#f0f0ee", fontSize: 14, outline: "none",
  },

  // Vitrine
  main: { maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem 4rem" },
  vitrineHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" },
  vitrineTitle: { fontFamily: "'Syne', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#f0f0ee" },
  vitrineCount: {
    background: "#1e2022", border: "1px solid #2a2c2f",
    borderRadius: 999, padding: "3px 12px", fontSize: 12, color: "#888",
  },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" },

  
  skeleton: { background: "#161719", border: "1px solid #2a2c2f", borderRadius: 16, overflow: "hidden" },
  skeletonImg: { height: 190, background: "linear-gradient(90deg, #1e2022 25%, #2a2c2f 50%, #1e2022 75%)", backgroundSize: "600px 100%", animation: "shimmer 1.4s infinite linear" },
  skeletonLine: { height: 12, borderRadius: 6, background: "linear-gradient(90deg, #1e2022 25%, #2a2c2f 50%, #1e2022 75%)", backgroundSize: "600px 100%", animation: "shimmer 1.4s infinite linear" },

  
  stateError: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "4rem 2rem", color: "#ff4545", textAlign: "center" },
  stateEmpty: { gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "4rem 2rem", color: "#888", textAlign: "center" },


  btnGreen: {
    background: "#044040", color: "#f9fefe",
    border: "1px solid #044040", borderRadius: 8,
    padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14,
  },
  btnOutline: {
    background: "none", color: "#ff4545",
    border: "1px solid #ff4545", borderRadius: 8,
    padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14,
  },

  
  footer: {
    borderTop: "1px solid #1e2022", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    padding: "1.5rem 2.5rem",
  },
};