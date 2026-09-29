interface Props {
  tipe: 'Bimbingan' | 'Konseling';
}

export default function PembinaanIllustration({ tipe }: Props) {
  const accent = tipe === 'Bimbingan' ? '#f59e0b' : '#dc2626';
  const bg = tipe === 'Bimbingan' ? '#fef3c7' : '#fee2e2';

  return (
    <svg viewBox="0 0 320 220" className="w-full h-full max-w-[320px]" style={{ background: 'transparent' }}>
      {/* Background subtle wave */}
      <path
        d="M 0,180 Q 80,140 160,175 T 320,165 L 320,220 L 0,220 Z"
        fill={bg}
        opacity="0.5"
      />

      {/* Whiteboard / screen behind */}
      <rect x="180" y="30" width="110" height="70" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="195" y1="50" x2="280" y2="50" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="195" y1="60" x2="270" y2="60" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="195" y1="70" x2="275" y2="70" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="195" y1="80" x2="260" y2="80" stroke="#cbd5e1" strokeWidth="1" />

      {/* Stand for whiteboard */}
      <line x1="235" y1="100" x2="235" y2="160" stroke="#94a3b8" strokeWidth="2" />

      {/* Table */}
      <rect x="40" y="155" width="180" height="6" rx="2" fill="#64748b" />
      <line x1="60" y1="161" x2="60" y2="195" stroke="#64748b" strokeWidth="2" />
      <line x1="200" y1="161" x2="200" y2="195" stroke="#64748b" strokeWidth="2" />

      {/* Person 1 (Pembina / Pimpinan) - standing on right */}
      <circle cx="255" cy="115" r="12" fill="#1e40af" />
      <rect x="243" y="130" width="24" height="38" rx="4" fill="#1e40af" />
      {/* Tie */}
      <polygon points="255,132 252,145 255,160 258,145" fill="#fbbf24" />
      {/* Legs */}
      <rect x="247" y="168" width="8" height="22" rx="2" fill="#1e293b" />
      <rect x="256" y="168" width="8" height="22" rx="2" fill="#1e293b" />
      {/* Arm pointing */}
      <path d="M 243,140 Q 225,135 215,145" stroke="#1e40af" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* Person 2 (Pegawai) - seated on left */}
      <circle cx="95" cy="125" r="11" fill={accent} />
      <rect x="84" y="140" width="22" height="30" rx="3" fill={accent} />
      {/* Legs */}
      <rect x="88" y="170" width="7" height="20" rx="2" fill="#334155" />
      <rect x="95" y="170" width="7" height="20" rx="2" fill="#334155" />
      {/* Chair back */}
      <rect x="76" y="150" width="4" height="40" rx="2" fill="#94a3b8" />
      {/* Arm on table */}
      <path d="M 106,148 Q 125,150 135,152" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* Laptop on table */}
      <rect x="115" y="140" width="28" height="18" rx="2" fill="#334155" />
      <rect x="117" y="142" width="24" height="14" rx="1" fill="#60a5fa" />
      <rect x="110" y="156" width="38" height="3" rx="1" fill="#1e293b" />

      {/* Documents on table */}
      <rect x="160" y="148" width="22" height="8" rx="1" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="163" y1="151" x2="179" y2="151" stroke="#cbd5e1" strokeWidth="0.8" />
      <line x1="163" y1="154" x2="175" y2="154" stroke="#cbd5e1" strokeWidth="0.8" />

      {/* Coffee cup */}
      <rect x="185" y="146" width="10" height="11" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
      <path d="M 195,150 Q 200,150 200,154 Q 200,157 195,157" stroke="#94a3b8" strokeWidth="1.5" fill="none" />

      {/* Speech bubble */}
      <g opacity="0.9">
        <path
          d="M 140,80 Q 140,60 170,60 Q 200,60 200,80 Q 200,95 185,98 L 190,110 L 175,98 Q 160,100 145,98 Q 140,90 140,80 Z"
          fill="#ffffff"
          stroke={accent}
          strokeWidth="1.5"
        />
        <line x1="155" y1="72" x2="185" y2="72" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="155" y1="80" x2="180" y2="80" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="155" y1="88" x2="175" y2="88" stroke="#cbd5e1" strokeWidth="1.5" />
      </g>

      {/* Floor line */}
      <line x1="0" y1="195" x2="320" y2="195" stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
}