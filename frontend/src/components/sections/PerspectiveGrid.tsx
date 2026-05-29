import { COLORS } from '@/lib/design-system';

export function PerspectiveGrid() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full opacity-[0.15]"
      viewBox="0 0 1200 400"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.purple500} stopOpacity="0.8" />
          <stop offset="100%" stopColor={COLORS.purple500} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 16 }).map((_, i) => {
        const x = 80 + i * 65;
        return (
          <line
            key={`v-${i}`}
            x1={600}
            y1={200}
            x2={x}
            y2={400}
            stroke="url(#grid-fade)"
            strokeWidth="1"
          />
        );
      })}
      {Array.from({ length: 10 }).map((_, i) => {
        const y = 220 + i * 18;
        const spread = 40 + i * 52;
        return (
          <line
            key={`h-${i}`}
            x1={600 - spread}
            y1={y}
            x2={600 + spread}
            y2={y}
            stroke={COLORS.purple500}
            strokeOpacity={0.35 - i * 0.03}
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}
