import { useState } from 'react';

interface AvatarProps {
  logoUrl?: string;
  initials: string;
  size: number;
  fontSize?: number;
}

export function Avatar({ logoUrl, initials, size, fontSize }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showLogo = Boolean(logoUrl) && !failed;

  return (
    <span
      style={{
        width: size,
        height: size,
        flex: 'none',
        borderRadius: '50%',
        background: showLogo ? '#fff' : 'var(--color-accent-800)',
        color: 'var(--color-accent-100)',
        display: 'grid',
        placeItems: 'center',
        fontSize: fontSize ?? Math.round(size * 0.32),
        fontFamily: 'var(--font-heading)',
        overflow: 'hidden',
      }}
    >
      {showLogo ? (
        <img
          src={logoUrl}
          alt=""
          onError={() => setFailed(true)}
          style={{ width: '70%', height: '70%', objectFit: 'contain' }}
        />
      ) : (
        initials
      )}
    </span>
  );
}
