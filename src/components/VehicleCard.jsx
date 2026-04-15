import { getImageUrl } from "../servicos/api";
import "./VehicleCard.css";

export default function VehicleCard({ vehicle, onClick }) {
  // 1. Verifica se o veículo tem alguma imagem no array e pega a primeira
  const thumb = vehicle.images?.[0]?.url
    ? getImageUrl(vehicle.images[0].url)
    : null;

  // 2. Formata o preço para o padrão brasileiro
  const price = Number(vehicle.price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="vehicle-card" onClick={onClick}>
      <div className="vehicle-card-img-box">
        {/* 🛡️ A Mágica do Fallback Aplicada */}
        <img
          src={thumb || "/fallback-autozoom.png"}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="vehicle-card-img"
          onError={(e) => {
            e.target.onerror = null; // Trava de segurança contra loop infinito
            e.target.src = "/fallback-autozoom.png"; // Substitui a imagem quebrada
          }}
        />

        <span className="vehicle-card-badge">
          {vehicle.manufactureYear}/{vehicle.modelYear}
        </span>
      </div>

      <div className="vehicle-card-body">
        <h3 className="vehicle-card-title">
          {vehicle.brand} {vehicle.model}
        </h3>

        <p className="vehicle-card-sub">
          {vehicle.location} · {vehicle.mileage?.toLocaleString("pt-BR")} km
        </p>

        <p className="vehicle-card-engine">
          {vehicle.engine} · {vehicle.transmission}
        </p>

        <div className="vehicle-card-footer">
          <span className="vehicle-card-price">{price}</span>
          <span className="vehicle-card-seller">
            {vehicle.user?.name?.split(" ")[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
