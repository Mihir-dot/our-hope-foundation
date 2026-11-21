import { useId } from 'react';
import styles from './HopeLogo.module.css';

type Props = {
  variant?: 'full' | 'mark';
  className?: string;
  decorative?: boolean;
};

export function HopeLogo({ variant = 'full', className = '', decorative = false }: Props) {
  const uid = `ohf${useId().replace(/:/g, '')}`;
  const full = variant === 'full';

  return (
    <svg
      className={`${styles.logo} ${className}`.trim()}
      viewBox={full ? '0 0 520 660' : '0 0 520 400'}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Our Hope Foundation'}
      aria-hidden={decorative ? true : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}-beam`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFE566" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#FFE566" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFE566" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-hill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7BC96A" />
          <stop offset="100%" stopColor="#2F8F3A" />
        </linearGradient>
        <clipPath id={`${uid}-tower`}>
          <path d="M214 126 L306 126 L328 268 L192 268 Z" />
        </clipPath>
      </defs>

      <g className={styles.bird} fill="#1BB5C4">
        <path d="M78 62c14-18 26-10 36 2-16 1-26 7-36 16-4-6-6-12 0-18z" />
      </g>
      <g className={`${styles.bird} ${styles.birdDelay}`} fill="#F04E98">
        <path d="M132 38c12-16 24-8 32 3-14 1-22 6-32 14-3-6-5-11 0-17z" />
      </g>
      <g className={`${styles.bird} ${styles.birdLate}`} fill="#E86A12">
        <path d="M176 58c11-14 20-7 28 2-12 1-19 5-28 12-3-5-5-9 0-14z" />
      </g>

      <polygon className={styles.beam} points="300,104 512,58 512,158" fill={`url(#${uid}-beam)`} />

      <path className={styles.wave} fill="#2451C9" d="M18 332c46-78 120-92 188-46 42 28 78 18 126-8 62-34 112-8 168 18 18 8 22 36 8 52-78 28-168 18-250 4-78-14-150-8-240-20z" />
      <path className={`${styles.wave} ${styles.waveAlt}`} fill="#1BB5C4" d="M250 318c40 28 78 18 120-6 36-20 70-8 112 10 8 16-8 36-28 42-48 8-96 2-140-8-36-8-62-4-64-38z" />
      <path className={styles.wave} fill="#E86A12" d="M300 300c34 8 62 2 96-16 22-12 48-6 70 8 6 14-10 28-24 32-36 10-70 6-104-2-20-6-34-8-38-22z" />
      <path fill="#F04E98" d="M360 336c28 10 52 6 78-4 10 12 2 26-14 30-28 6-52 2-74-6-6-8 0-16 10-20z" />

      <ellipse cx="262" cy="292" rx="132" ry="38" fill={`url(#${uid}-hill)`} />

      <g>
        <path d="M196 126h128l8 14H188z" fill="#1A2456" />
        <path d="M214 78h92l10 48H204z" fill="#1A2456" />
        <rect x="228" y="90" width="64" height="28" rx="3" fill="#FFE566" />
        <path d="M206 80 L260 42 L314 80 Z" fill="#1A2456" />
        <rect x="254" y="28" width="12" height="16" rx="2" fill="#1A2456" />
        <circle cx="260" cy="24" r="4" fill="#1A2456" />
        <g clipPath={`url(#${uid}-tower)`}>
          <rect x="192" y="126" width="24" height="150" fill="#2451C9" />
          <rect x="216" y="126" width="20" height="150" fill="#7A45C4" />
          <rect x="236" y="126" width="20" height="150" fill="#F04E98" />
          <rect x="256" y="126" width="20" height="150" fill="#E86A12" />
          <rect x="276" y="126" width="22" height="150" fill="#FFE566" />
          <rect x="298" y="126" width="18" height="150" fill="#2F8F3A" />
          <rect x="316" y="126" width="16" height="150" fill="#1BB5C4" />
        </g>
        <path d="M246 196c0-16 8-24 14-24s14 8 14 24v40h-28z" fill="#FFF8F1" opacity="0.92" />
        <path d="M252 168h16v18h-16z" fill="#FFE566" />
      </g>

      <g fill="#1A2456">
        <circle cx="132" cy="176" r="16" />
        <path d="M112 196c6 10 14 16 28 20l-2 28-16 36h16l12-26 8 26h16l-18-40 8-22c10 2 16 10 18 20l14 8-6-22c-2-18-14-30-32-32-16-2-28 4-36 4z" />
        <path d="M104 214c8-2 16 2 20 8l-8 6c-6-2-12-2-16 0z" fill="#6E8CFF" />
        <path d="M108 220l24-4 2 14-24 5z" fill="#2451C9" />
      </g>
      <g fill="#1A2456">
        <circle cx="392" cy="174" r="16" />
        <path d="M404 168c10 2 16 10 14 18-6 2-8 8-6 12 6-8 16-6 18 2-8 6-14 2-16 8-2-8-8-10-10-16-6 2-8 8-4 14 2-10-2-16-10-18 4-8 8-16 14-20z" fill="#1A2456" />
        <path d="M366 198c8 8 18 14 34 16l6 26 16 34h-16l-10-24-8 24h-16l20-38-6-18c-12-2-22-8-28-16 2-2 6-4 8-4z" />
        <path d="M352 228l22-8 4 12-22 8z" fill="#F04E98" />
      </g>

      {full ? (
        <g>
          <text className={styles.wordmark} y="470" fontSize="72">
            <tspan x="28" fill="#2451C9">O</tspan>
            <tspan x="84" fill="#1BB5C4">U</tspan>
            <tspan x="142" fill="#2F8F3A">R</tspan>
            <tspan x="214" fill="#E86A12">H</tspan>
            <tspan x="270" fill="#E09400">O</tspan>
            <tspan x="326" fill="#F04E98">P</tspan>
            <tspan x="382" fill="#7A45C4">E</tspan>
          </text>
          <line x1="36" y1="512" x2="132" y2="512" stroke="#F04E98" strokeWidth="4" strokeLinecap="round" />
          <text className={styles.foundation} x="260" y="520" textAnchor="middle" fill="#1A2456" fontSize="20">
            FOUNDATION
          </text>
          <line x1="388" y1="512" x2="484" y2="512" stroke="#1BB5C4" strokeWidth="4" strokeLinecap="round" />
          <text className={styles.tagline} y="562" fontSize="11" textAnchor="middle">
            <tspan x="260" fill="#0C7C88">NURTURING ABILITIES</tspan>
          </text>
          <text className={styles.tagline} y="580" fontSize="11" textAnchor="middle">
            <tspan x="168" fill="#C4470F">INSPIRING FUTURES</tspan>
            <tspan fill="#4E596B">  ·  </tspan>
            <tspan fill="#7A45C4">BUILDING TOMORROWS</tspan>
          </text>
          <g transform="translate(244 600)" fill="none" stroke="#F04E98" strokeWidth="3" strokeLinecap="round">
            <path d="M16 28 C16 28 2 18 2 10 a8 8 0 0 1 14-4 a8 8 0 0 1 14 4 c0 8-14 18-14 18z" />
            <path d="M16 6 v-8 M10 8 l-6-6 M22 8 l6-6" stroke="#F04E98" />
          </g>
        </g>
      ) : null}
    </svg>
  );
}
