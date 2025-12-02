import React from 'react';

interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
}

/**
 * App Logo with "AIDE" text
 * Uses vibrant gradient (#667eea → #764ba2)
 */
export function AppLogoWithText({ size = 120, className = '' }: IconProps) {
  const height = typeof size === 'number' ? (size * 40) / 120 : 'auto';

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 120 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="60"
        y="28"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="url(#logo-gradient)"
        fontSize="32"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.5"
      >
        AIDE
      </text>
    </svg>
  );
}

/**
 * App Icon only (no text)
 * Uses cyan-to-pink gradient (#00E0FF → #FF6DDF)
 */
export function AppIcon({ size = 60, className = '' }: IconProps) {
  const height = typeof size === 'number' ? (size * 102.7) / 118.6 : 'auto';

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 118.6 102.7"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#00E0FF', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FF6DDF', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Hexagonal icon with electrical device - placeholder */}
      <path
        d="M59.3 0 L118.6 25.7 L118.6 77 L59.3 102.7 L0 77 L0 25.7 Z"
        fill="url(#icon-gradient)"
        opacity="0.8"
      />
      <circle cx="59.3" cy="51.35" r="30" fill="white" opacity="0.3" />
    </svg>
  );
}
