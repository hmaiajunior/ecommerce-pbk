// ProductCard.jsx — Playbekids product card

const productCardStyles = {
  card: {
    background: '#fff', borderRadius: 20, overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(61,43,31,0.09)',
    display: 'flex', flexDirection: 'column',
    transition: 'transform .18s, box-shadow .18s',
    cursor: 'pointer',
  },
  img: {
    width: '100%', height: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', fontSize: 64, flexShrink: 0,
  },
  badge: {
    position: 'absolute', top: 12, left: 12,
    background: '#FF6B4A', color: '#fff',
    fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 11,
    padding: '4px 12px', borderRadius: 100,
    textTransform: 'uppercase', letterSpacing: '.04em',
  },
  body: { padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 },
  name: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15,
    color: '#3D2B1F', marginBottom: 8,
  },
  sizes: { display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 },
  sizeChip: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 11,
    color: '#9A7B70', background: '#f5ede8',
    padding: '2px 8px', borderRadius: 100,
  },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12, marginTop: 'auto' },
  price: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: '#FF6B4A',
  },
  priceOld: {
    fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13,
    color: '#A08078', textDecoration: 'line-through',
  },
  btn: {
    width: '100%', border: 'none', borderRadius: 100,
    padding: '10px 0', fontFamily: "'Nunito', sans-serif",
    fontWeight: 900, fontSize: 14, cursor: 'pointer',
  },
};

const badgeColors = {
  'Novo': { bg: '#FF6B4A', color: '#fff' },
  'Promoção': { bg: '#FFD340', color: '#3D2B1F' },
  'Atacado': { bg: '#3D7EBF', color: '#fff' },
  'Esgotado': { bg: '#EDE0DC', color: '#A08078' },
};

function ProductCard({ product, onAddToCart }) {
  const { name, emoji, bg, badge, sizes, price, priceOld, soldOut } = product;
  const badgeStyle = badgeColors[badge] || { bg: '#FF6B4A', color: '#fff' };
  return (
    <div style={productCardStyles.card}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(61,43,31,0.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(61,43,31,0.09)'; }}>
      <div style={{...productCardStyles.img, background: bg}}>
        <span>{emoji}</span>
        {badge && <div style={{...productCardStyles.badge, background: badgeStyle.bg, color: badgeStyle.color}}>{badge}</div>}
      </div>
      <div style={productCardStyles.body}>
        <div style={productCardStyles.name}>{name}</div>
        <div style={productCardStyles.sizes}>
          {sizes.map(s => <span key={s} style={productCardStyles.sizeChip}>{s}</span>)}
        </div>
        <div style={productCardStyles.priceRow}>
          <span style={soldOut ? {...productCardStyles.price, color:'#A08078', fontSize:14} : productCardStyles.price}>
            {soldOut ? 'Esgotado' : price}
          </span>
          {priceOld && !soldOut && <span style={productCardStyles.priceOld}>{priceOld}</span>}
        </div>
        <button
          disabled={soldOut}
          onClick={() => !soldOut && onAddToCart && onAddToCart(product)}
          style={{
            ...productCardStyles.btn,
            background: soldOut ? '#EDE0DC' : '#FF6B4A',
            color: soldOut ? '#A08078' : '#fff',
            boxShadow: soldOut ? 'none' : '0 4px 14px rgba(255,107,74,.25)',
            cursor: soldOut ? 'not-allowed' : 'pointer',
          }}>
          {soldOut ? 'Indisponível' : 'Adicionar ao carrinho'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ProductCard });
