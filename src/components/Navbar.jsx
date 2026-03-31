export default function Navbar({ onNavigate, currentUser, onLogout }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => onNavigate("home")}>
         AutoZuum
      </div>

      <div style={styles.links}>
        {currentUser && (
          <button style={styles.link} onClick={() => onNavigate("new-vehicle")}>
            + Anunciar
          </button>
        )}
      </div>

      <div>
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={styles.userBtn}
              onClick={() => onNavigate("profile", { userId: currentUser.id })}
            >
              👤 {currentUser.name?.split(" ")[0]}
            </span>
            <button style={styles.btnRed} onClick={onLogout}>
              Sair
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.btnOutline} onClick={() => onNavigate("login")}>
              Entrar
            </button>
            <button style={styles.btnSolid} onClick={() => onNavigate("register")}>
              Cadastrar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 2rem", height: 64, background: "#111",
    borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 100,
  },
  brand: { fontWeight: 800, fontSize: "1.2rem", color: "#ff4545", cursor: "pointer" },
  links: { display: "flex", gap: 4 },
  link: {
    background: "none", border: "none", color: "#aaa",
    padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 14,
  },
  userBtn: { color: "#aaa", cursor: "pointer", fontSize: 14, padding: "6px 14px", borderRadius: 8 },
  btnOutline: {
    background: "none", border: "1px solid #ff4545", color: "#ff4545",
    padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700,
  },
  btnSolid: {
    background: "#044040", border: "1px solid #044040", color: "#f9fefe",
    padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700,
  },
  btnRed: {
    background: "rgba(255,69,69,0.15)", border: "1px solid #ff4545", color: "#ff4545",
    padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
  },
};