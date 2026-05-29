export function AuthPageLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07060D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="ir-loader-scale-in"
        style={{
          background: 'rgba(138,92,246,0.07)',
          border: '1px solid rgba(138,92,246,0.18)',
          borderRadius: '16px',
          padding: '40px 36px',
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {['60%', '80%', '80%', '50%'].map((w, i) => (
          <div
            key={i}
            style={{
              width: w,
              height: i === 0 ? 16 : i === 3 ? 40 : 44,
              borderRadius: i === 3 ? 10 : 8,
              background:
                i === 3
                  ? 'rgba(124,58,237,0.25)'
                  : 'linear-gradient(90deg,#1A1730 25%,#2A2450 50%,#1A1730 75%)',
              backgroundSize: '400px 100%',
              animation: `ir-shimmer 1.8s ease-in-out infinite ${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
