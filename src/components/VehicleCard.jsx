import { getImageUrl } from "../servicos/api";
import "./VehicleCard.css";

export default function VehicleCard({ vehicle, onClick }) {
  const thumb = vehicle.VehicleImages?.[0]?.url
    ? getImageUrl(vehicle.VehicleImages[0].url)
    : null;

  const price = Number(vehicle.price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="vehicle-card" onClick={onClick}>
      <div className="vehicle-card-img-box">
        {thumb ? (
          <img src={thumb} alt="" className="vehicle-card-img" />
        ) : (
          <div className="vehicle-card-no-img">Sem foto</div>
        )}

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
            {vehicle.User?.name?.split(" ")[0]}
          </span>
        </div>
      </div>
    </div>
  );
}