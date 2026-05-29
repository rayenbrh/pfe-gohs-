import { COLORS, FONTS } from '@/lib/design-system';

export default function NotFound() {
  return (
    <html lang="fr">
      <body
        style={{
          background: COLORS.bgBase,
          color: COLORS.textPrimary,
          fontFamily: FONTS.body,
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h1 style={{ fontSize: '4rem', fontWeight: 700 }}>404</h1>
        <p>Page introuvable</p>
      </body>
    </html>
  );
}
