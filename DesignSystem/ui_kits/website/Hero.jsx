// Hero.jsx — Playbekids homepage hero

const heroStyles = {
  hero: {
    position: 'relative', overflow: 'hidden',
    background: '#fff9f0',
    minHeight: 480, display: 'flex', alignItems: 'center',
    padding: '60px 64px',
  },
  blob: { position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' },
  inner: { position: 'relative', zIndex: 1, maxWidth: 560 },
  tag: {
    display: 'inline-block',
    background: '#FFD340', color: '#3D2B1F',
    fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 13,
    padding: '5px 16px', borderRadius: 100, marginBottom: 20,
    textTransform: 'uppercase', letterSpacing: '.06em',
  },
  h1: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 900,
    fontSize: 56, lineHeight: 1.1, color: '#3D2B1F', margin: '0 0 16px',
  },
  span: { color: '#FF6B4A' },
  p: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 600,
    fontSize: 18, color: '#6B4F42', lineHeight: 1.6, margin: '0 0 32px',
  },
  btns: { display: 'flex', gap: 14, flexWrap: 'wrap' },
  btnPrimary: {
    background: '#FF6B4A', color: '#fff', border: 'none',
    borderRadius: 100, padding: '14px 32px',
    fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 17,
    cursor: 'pointer', boxShadow: '0 4px 18px rgba(255,107,74,.30)',
  },
  btnSecondary: {
    background: 'transparent', color: '#FF6B4A',
    border: '2.5px solid #FF6B4A', borderRadius: 100, padding: '12px 28px',
    fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 17, cursor: 'pointer',
  },
  imgWrap: {
    position: 'absolute', right: 64, top: '50%',
    transform: 'translateY(-50%)',
    width: 340, height: 340, borderRadius: '50%',
    background: '#f5ede8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 40px rgba(61,43,31,0.12)',
    overflow: 'hidden',
  },
  imgPlaceholder: { fontSize: 120, opacity: .55 },
};

function Hero({ setPage }) {
  return (
    <section style={heroStyles.hero}>
      {/* Blobs */}
      <div style={{...heroStyles.blob, width:500,height:500,background:'#FF6B4A',opacity:.10,top:-160,left:-140}} />
      <div style={{...heroStyles.blob, width:400,height:400,background:'#FFD340',opacity:.14,bottom:-140,left:300}} />
      <div style={{...heroStyles.blob, width:280,height:280,background:'#4EC9C0',opacity:.12,top:60,right:400}} />
      {/* Dots */}
      <div style={{position:'absolute',width:14,height:14,borderRadius:'50%',background:'#FF6B4A',opacity:.25,top:80,left:340}} />
      <div style={{position:'absolute',width:10,height:10,borderRadius:'50%',background:'#FFD340',opacity:.45,top:200,left:580}} />
      <div style={{position:'absolute',width:16,height:16,borderRadius:'50%',background:'#4EC9C0',opacity:.25,bottom:80,right:440}} />

      <div style={heroStyles.inner}>
        <span style={heroStyles.tag}>Nova Coleção 2025 🌟</span>
        <h1 style={heroStyles.h1}>Moda para os<br/><span style={heroStyles.span}>pequenos aventureiros</span></h1>
        <p style={heroStyles.p}>Roupas infantis masculinas com estilo e qualidade.<br/>Atacado e varejo para todo o Brasil.</p>
        <div style={heroStyles.btns}>
          <button style={heroStyles.btnPrimary} onClick={() => setPage('shop')}>Ver coleção</button>
          <button style={heroStyles.btnSecondary} onClick={() => setPage('atacado')}>Quero revender</button>
        </div>
      </div>

      <div style={heroStyles.imgWrap}>
        <span style={heroStyles.imgPlaceholder}>👕</span>
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
