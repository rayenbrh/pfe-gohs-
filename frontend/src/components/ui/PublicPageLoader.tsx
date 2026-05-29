export function PublicPageLoader({ overlay = false }: { overlay?: boolean }) {
  return (
    <div
      className="ir-public-loader"
      style={{
        minHeight: overlay ? '100%' : '100vh',
        height: overlay ? '100%' : undefined,
        background: '#07060D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 25% 40%, rgba(255,255,255,0.3) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 40% 8%, rgba(255,255,255,0.5) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 55% 60%, rgba(255,255,255,0.2) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 70% 25%, rgba(255,255,255,0.4) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 90% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 15% 80%, rgba(255,255,255,0.2) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 60% 90%, rgba(255,255,255,0.3) 0%, transparent 100%),' +
            'radial-gradient(1px 1px at 35% 55%, rgba(255,255,255,0.4) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.20) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="ir-loader-fade-in"
        style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #7C3AED, #22D3EE)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display), Orbitron, monospace',
              fontSize: '14px',
              fontWeight: 900,
              color: '#fff',
            }}
          >
            IR
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display), Orbitron, monospace',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#E8E6F0',
          }}
        >
          INOVA
          <span style={{ color: '#7C3AED' }}>RIDE</span>
        </span>
      </div>

      <div
        className="ir-loader-scale-in"
        style={{ position: 'relative', width: '56px', height: '56px', zIndex: 1 }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            border: '1px solid rgba(124,58,237,0.15)',
            animation: 'ir-pulse-ring 1.8s ease-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(124,58,237,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#7C3AED',
            borderRightColor: 'rgba(124,58,237,0.3)',
            animation: 'ir-spin 0.85s cubic-bezier(0.5,0,0.5,1) infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '18px',
            borderRadius: '50%',
            background: 'rgba(124,58,237,0.4)',
            boxShadow: '0 0 8px rgba(124,58,237,0.6)',
          }}
        />
      </div>

      <div className="ir-loader-fade-in-delayed" style={{ display: 'flex', gap: '8px', zIndex: 1 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: i === 0 ? '#7C3AED' : i === 1 ? '#9F67FA' : '#C4B5FD',
              animation: `ir-dot-bounce 1.4s ease infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
