import { getImageUrl } from "../servicos/api";
// @ts-ignore - Mantido para evitar o falso positivo do CRA com ficheiros CSS
import "../styles/VehicleCard.css";
// Importação da nossa Interface Global
import { IVehicle } from "../types";

// Tipagem rigorosa das propriedades (Props) que o componente recebe
interface VehicleCardProps {
  vehicle: IVehicle;
  onClick: () => void;
}

export default function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
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
          onError={(e: any) => {
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
            {vehicle.user?.name?.split(" ")[0] ||
              vehicle.Buyer?.name?.split(" ")[0] ||
              "Vendedor"}
          </span>
        </div>
      </div>
    </div>
  );
}
