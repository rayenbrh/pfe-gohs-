function SkeletonLine({
  width = '100%',
  height = 12,
  borderRadius = 6,
  delay = 0,
}: {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  delay?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #1A1730 25%, #2A2450 50%, #1A1730 75%)',
        backgroundSize: '400px 100%',
        animation: `ir-shimmer 1.8s ease-in-out infinite ${delay}s`,
      }}
    />
  );
}

function SkeletonCard({ height = 80, delay = 0 }: { height?: number; delay?: number }) {
  return (
    <div
      className="ir-loader-fade-in"
      style={{
        background: '#0F0D1A',
        border: '1px solid rgba(138,92,246,0.10)',
        borderRadius: '12px',
        padding: '16px',
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        animationDelay: `${delay}s`,
      }}
    >
      <SkeletonLine width="45%" height={10} delay={delay} />
      <SkeletonLine width="70%" height={22} borderRadius={4} delay={delay + 0.05} />
      <SkeletonLine width="35%" height={8} delay={delay + 0.1} />
    </div>
  );
}

export function AdminPageLoader() {
  return (
    <div
      style={{
        width: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div className="ir-loader-fade-in">
        <SkeletonLine width="180px" height={14} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}
      >
        <SkeletonCard delay={0.05} />
        <SkeletonCard delay={0.1} />
        <SkeletonCard delay={0.15} />
        <SkeletonCard delay={0.2} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          className="ir-loader-fade-in"
          style={{
            background: '#0F0D1A',
            border: '1px solid rgba(138,92,246,0.10)',
            borderRadius: '12px',
            padding: '20px',
            height: '240px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animationDelay: '0.25s',
          }}
        >
          <SkeletonLine width="40%" height={12} delay={0.25} />
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              paddingBottom: '8px',
            }}
          >
            {[55, 72, 48, 85, 63, 90, 74, 58, 82, 67, 78, 92].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: '4px 4px 0 0',
                  background: 'linear-gradient(90deg, #1A1730 25%, #2A2450 50%, #1A1730 75%)',
                  backgroundSize: '400px 100%',
                  animation: `ir-shimmer 1.8s ease-in-out infinite ${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="ir-loader-fade-in"
          style={{
            background: '#0F0D1A',
            border: '1px solid rgba(138,92,246,0.10)',
            borderRadius: '12px',
            padding: '20px',
            height: '240px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            animationDelay: '0.3s',
          }}
        >
          <SkeletonLine width="60%" height={12} delay={0.3} />
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              border: '14px solid #1A1730',
              background: 'linear-gradient(90deg, #1A1730 25%, #2A2450 50%, #1A1730 75%)',
              backgroundSize: '400px 100%',
              animation: 'ir-shimmer 1.8s ease-in-out infinite 0.3s',
            }}
          />
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonLine width="80%" height={8} delay={0.35} />
            <SkeletonLine width="65%" height={8} delay={0.4} />
            <SkeletonLine width="72%" height={8} delay={0.45} />
          </div>
        </div>
      </div>

      <div
        className="ir-loader-fade-in"
        style={{
          background: '#0F0D1A',
          border: '1px solid rgba(138,92,246,0.10)',
          borderRadius: '12px',
          padding: '20px',
          animationDelay: '0.35s',
        }}
      >
        <SkeletonLine width="200px" height={12} delay={0.35} />
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '12px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(138,92,246,0.08)',
            }}
          >
            {[40, 100, 80, 90, 60, 60, 50].map((w, i) => (
              <SkeletonLine key={i} width={w} height={8} delay={0.4 + i * 0.03} />
            ))}
          </div>
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '12px',
                padding: '8px 0',
                borderBottom: '1px solid rgba(138,92,246,0.05)',
              }}
            >
              {[40, 100, 80, 90, 60, 60, 50].map((w, i) => (
                <SkeletonLine
                  key={i}
                  width={w}
                  height={10}
                  delay={0.45 + row * 0.05 + i * 0.02}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
