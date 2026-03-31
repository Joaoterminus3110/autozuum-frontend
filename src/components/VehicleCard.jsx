import { getImageUrl } from "../servicos/api";

export default function VehicleCard({ vehicle, onClick }) {
  const thumb = vehicle.VehicleImages?.[0]?.url
    ? getImageUrl(vehicle.VehicleImages[0].url)
    : null;

  const price = Number(vehicle.price).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL",
  });

  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.imgBox}>
        {thumb ? (
          <img src={thumb} alt="" style={styles.img} />
        ) : (
          <div style={styles.noImg}>Sem foto</div>
        )}
        <span style={styles.badge}>
          {vehicle.manufactureYear}/{vehicle.modelYear}
        </span>
      </div>
      <div style={styles.body}>
        <h3 style={styles.title}>{vehicle.brand} {vehicle.model}</h3>
        <p style={styles.sub}>{vehicle.location} · {vehicle.mileage?.toLocaleString("pt-BR")} km</p>
        <p style={styles.engine}>{vehicle.engine} · {vehicle.transmission}</p>
        <div style={styles.footer}>
          <span style={styles.price}>{price}</span>
          <span style={styles.seller}>{vehicle.User?.name?.split(" ")[0]}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#161719", border: "1px solid #2a2c2f", borderRadius: 16,
    overflow: "hidden", cursor: "pointer", transition: "transform 0.2s",
  },
  imgBox: { position: "relative", height: 180, background: "#1e2022" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: {
    height: "100%", display: "flex", alignItems: "center",
    justifyContent: "center", color: "#555", fontSize: 13,
  },
  badge: {
    position: "absolute", top: 8, right: 8,
    background: "rgba(0,0,0,0.7)", color: "#aaa",
    padding: "3px 10px", borderRadius: 20, fontSize: 11,
  },
  body: { padding: "12px 14px" },
  title: { fontSize: "1rem", fontWeight: 700, marginBottom: 4, color: "#f0f0ee" },
  sub: { fontSize: 12, color: "#888", marginBottom: 4 },
  engine: { fontSize: 12, color: "#555", marginBottom: 10 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  price: { fontWeight: 800, color:"#044040", fontSize: "1rem" },
  seller: { fontSize: 11, color: "#555" },
};