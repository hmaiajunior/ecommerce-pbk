// Header.jsx — Playbekids site header

const headerStyles = {
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(255,249,240,0.92)', backdropFilter: 'blur(12px)',
    borderBottom: '1.5px solid #EDE0DC',
    padding: '0 32px', height: 68,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logoWrap: {
    width: 46, height: 46, borderRadius: '50%',
    background: '#f5ede8', overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(0,0,0,0.11)', flexShrink: 0, cursor: 'pointer',
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 38%' },
  brand: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20,
    color: '#3D2B1F', letterSpacing: '-0.01em', cursor: 'pointer',
  },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  nav: { display: 'flex', alignItems: 'center', gap: 4 },
  navLink: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15,
    color: '#6B4F42', padding: '6px 14px', borderRadius: 100,
    cursor: 'pointer', transition: 'all .15s',
    background: 'transparent', border: 'none',
  },
  navLinkActive: { background: '#f5ede8', color: '#FF6B4A' },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  cartBtn: {
    background: '#FF6B4A', color: '#fff', border: 'none',
    borderRadius: 100, padding: '8px 18px', fontFamily: "'Nunito', sans-serif",
    fontWeight: 900, fontSize: 14, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255,107,74,.28)',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  badge: {
    background: '#FFD340', color: '#3D2B1F', borderRadius: '50%',
    width: 18, height: 18, fontSize: 10, fontWeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  searchBtn: {
    background: '#f5ede8', border: 'none', borderRadius: 100,
    width: 38, height: 38, cursor: 'pointer', fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};

function Header({ activePage, setPage }) {
  const navItems = [
    { id: 'home', label: 'Início' },
    { id: 'shop', label: 'Loja' },
    { id: 'atacado', label: 'Atacado' },
    { id: 'sobre', label: 'Sobre' },
  ];
  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.left}>
        <div style={headerStyles.logoWrap} onClick={() => setPage('home')}>
          <img src="../../assets/logo.jpeg" alt="Playbekids" style={headerStyles.logoImg} />
        </div>
        <span style={headerStyles.brand} onClick={() => setPage('home')}>Playbekids</span>
      </div>
      <nav style={headerStyles.nav}>
        {navItems.map(item => (
          <button key={item.id}
            style={activePage === item.id
              ? {...headerStyles.navLink, ...headerStyles.navLinkActive}
              : headerStyles.navLink}
            onClick={() => setPage(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>
      <div style={headerStyles.right}>
        <button style={headerStyles.searchBtn}>🔍</button>
        <button style={headerStyles.cartBtn}>
          <span>Carrinho</span>
          <span style={headerStyles.badge}>3</span>
        </button>
      </div>
    </header>
  );
}

Object.assign(window, { Header });
