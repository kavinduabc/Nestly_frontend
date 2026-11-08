interface LogoProps {
  variant?: 'full' | 'symbol'
  className?: string
  size?: number
  inverted?: boolean
}

export function Logo({ variant = 'full', className = '', size = 40, inverted = false }: LogoProps) {
  const symbol = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Nestly logo"
    >
      {/* Rounded square background */}
      <rect width="64" height="64" rx="14" fill="#0F6E56" />
      {/* Map pin white shape */}
      <path
        d="M32 10C23.163 10 16 17.163 16 26C16 37.5 32 54 32 54C32 54 48 37.5 48 26C48 17.163 40.837 10 32 10Z"
        fill="white"
      />
      {/* House roof */}
      <path d="M32 17L22 25H24V35H40V25H42L32 17Z" fill="#0F6E56" />
      {/* Door (amber) */}
      <rect x="28.5" y="28" width="7" height="7" rx="1" fill="#EF9F27" />
    </svg>
  )

  if (variant === 'symbol') return <span className={className}>{symbol}</span>

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {symbol}
      <span className="flex flex-col leading-none">
        <span className="font-bold text-2xl tracking-tight">
          <span className={inverted ? 'text-white' : 'text-gray-900 dark:text-white'}>Nestl</span>
          <span className="text-[#1D9E75]">y</span>
        </span>
        <span className="text-[9px] font-medium tracking-[0.2em] text-gray-400 uppercase mt-0.5">
          Find your place
        </span>
      </span>
    </span>
  )
}
