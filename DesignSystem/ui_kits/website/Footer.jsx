// Footer.jsx — Playbekids site footer

const footerStyles = {
  footer: {
    background: '#3D2B1F', color: '#fff',
    padding: '48px 64px 32px', marginTop: 80,
  },
  top: { display: 'flex', gap: 48, flexWrap: 'wrap', marginBottom: 40 },
  col: { flex: 1, minWidth: 180 },
  logoWrap: {
    width: 52, height: 52, borderRadius: '50%',
    background: '#f5ede8', overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
    marginBottom: 12,
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 38%' },
  brandName: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22,
    color: '#fff', marginBottom: 6,
  },
  tagline: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: 14,
    color: '#9A7B70', lineHeight: 1.6,
  },
  colTitle: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 13,
    color: '#FFD340', textTransform: 'uppercase', letterSpacing: '.08em',
    marginBottom: 14,
  },
  link: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: 14,
    color: '#EDE0DC', display: 'block', marginBottom: 8, cursor: 'pointer',
    textDecoration: 'none',
  },
  socialRow: { display: 'flex', gap: 10, marginTop: 16 },
  socialChip: {
    background: '#FF6B4A', color: '#fff', borderRadius: 100,
    padding: '6px 16px', fontFamily: "'Nunito', sans-serif",
    fontWeight: 800, fontSize: 13, cursor: 'pointer', border: 'none',
  },
  divider: { borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0 0 20px' },
  bottom: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
  },
  copy: { fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: 13, color: '#9A7B70' },
  insta: { fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: '#4EC9C0' },
};

function Footer() {
  return (
    <footer style={footerStyles.footer}>
      <div style={footerStyles.top}>
        <div style={footerStyles.col}>
          <div style={footerStyles.logoWrap}>
            <img src="../../assets/logo.jpeg" alt="Playbekids" style={footerStyles.logoImg} />
          </div>
          <div style={footerStyles.brandName}>Playbekids</div>
          <div style={footerStyles.tagline}>Moda infantil masculina<br/>para os pequenos aventureiros.</div>
          <div style={footerStyles.socialRow}>
            <button style={footerStyles.socialChip}>@playbekids2</button>
          </div>
        </div>
        <div style={footerStyles.col}>
          <div style={footerStyles.colTitle}>Loja</div>
          {['Novidades', 'Camisetas', 'Bermudas', 'Conjuntos', 'Acessórios'].map(l => (
            <a key={l} style={footerStyles.link}>{l}</a>
          ))}
        </div>
        <div style={footerStyles.col}>
          <div style={footerStyles.colTitle}>Atacado</div>
          {['Como funciona', 'Tabela de preços', 'Mínimo por peça', 'Cadastro de revendedor'].map(l => (
            <a key={l} style={footerStyles.link}>{l}</a>
          ))}
        </div>
        <div style={footerStyles.col}>
          <div style={footerStyles.colTitle}>Ajuda</div>
          {['Frete & Entrega', 'Trocas & Devoluções', 'Tamanhos', 'Fale conosco'].map(l => (
            <a key={l} style={footerStyles.link}>{l}</a>
          ))}
        </div>
      </div>
      <div style={footerStyles.divider} />
      <div style={footerStyles.bottom}>
        <span style={footerStyles.copy}>© 2025 Playbekids. Todos os direitos reservados.</span>
        <span style={footerStyles.insta}>Instagram: @playbekids2</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
