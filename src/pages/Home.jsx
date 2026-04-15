import { useState, useEffect } from "react";
import { getVehicles } from "../servicos/api";
import VehicleCard from "../components/VehicleCard";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function HeroBanner() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="circle circle-red" />
        <div className="circle circle-green" />
        <div className="hero-grid" />
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          O carro dos seus
          <br />
          <span>sonhos está aqui.</span>
        </h1>

        <p className="hero-sub">
          Compre, venda e negocie veículos com segurança e transparência.
        </p>

        {!currentUser ? (
          <div className="hero-actions">
            <button className="btn-green" onClick={() => navigate("/register")}>
              Criar Conta
            </button>
            <button className="btn-outline" onClick={() => navigate("/login")}>
              Entrar
            </button>
          </div>
        ) : (
          <div className="hero-actions">
            <button className="btn-green" onClick={() => navigate("/anunciar")}>
              Anunciar meu carro agora
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function FilterBar({ filters, setFilters, onSearch }) {
  return (
    <div className="filter-bar">
      <input
        className="filter-input"
        placeholder="Marca ou modelo..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      <input
        className="filter-input"
        placeholder="Cidade / Estado"
        value={filters.location}
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
      />

      <select
        className="filter-input"
        value={filters.transmission}
        onChange={(e) =>
          setFilters({ ...filters, transmission: e.target.value })
        }
      >
        <option value="">Câmbio</option>
        <option value="Manual">Manual</option>
        <option value="Automático">Automático</option>
      </select>

      <select
        className="filter-input"
        value={filters.sort}
        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
      >
        <option value="">Ordenar por</option>
        <option value="price_asc">Menor preço</option>
        <option value="price_desc">Maior preço</option>
        <option value="mileage_asc">Menor KM</option>
        <option value="newest">Mais recentes</option>
      </select>

      <button className="btn-green" onClick={onSearch}>
        Buscar
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton">
      <div className="skeleton-img" />
      <div className="skeleton-content">
        <div className="skeleton-line line-80" />
        <div className="skeleton-line line-55" />
        <div className="skeleton-line line-35" />
      </div>
    </div>
  );
}

export default function Home({ onNavigate, currentUser }) {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    transmission: "",
    sort: "",
  });

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVehicles();
      setVehicles(data && Array.isArray(data.vehicles) ? data.vehicles : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filtered = vehicles
    .filter((v) => {
      const q = filters.search.toLowerCase();
      if (
        q &&
        !v.brand.toLowerCase().includes(q) &&
        !v.model.toLowerCase().includes(q)
      )
        return false;

      if (
        filters.location &&
        !v.location.toLowerCase().includes(filters.location.toLowerCase())
      )
        return false;

      if (filters.transmission && v.transmission !== filters.transmission)
        return false;

      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "price_asc") return a.price - b.price;
      if (filters.sort === "price_desc") return b.price - a.price;
      if (filters.sort === "mileage_asc") return a.mileage - b.mileage;
      if (filters.sort === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div className="page">
      <HeroBanner onNavigate={onNavigate} currentUser={currentUser} />

      <main className="main">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onSearch={fetchVehicles}
        />

        <div className="vitrine-header">
          <h2 className="vitrine-title">Veículos disponíveis</h2>

          {!loading && !error && (
            <span className="vitrine-count">
              {filtered.length} anúncio{filtered.length !== 1 ? "s" : ""}
            </span>
          )}

          {currentUser && (
            <button
              className="btn-green vitrine-btn"
              onClick={() => navigate("/anunciar")}
            >
              + Anunciar Veículo
            </button>
          )}
        </div>

        {error && (
          <div className="state-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button className="btn-outline" onClick={fetchVehicles}>
              Tentar novamente
            </button>
          </div>
        )}

        {!error && (
          <div className="cards-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <div className="state-empty">
                <span className="empty-icon">🔍</span>
                <p>Nenhum veículo encontrado com esses filtros.</p>
              </div>
            ) : (
              filtered.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  onClick={() => navigate(`/veiculo/${v.id}`)}
                />
              ))
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <span className="footer-brand">AutoZumm</span>
        <span className="footer-copy">
          © {new Date().getFullYear()} — Todos os direitos reservados
        </span>
      </footer>
    </div>
  );
}
