interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <img
      src="/little logo.png"
      alt="StockAI logo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  )
}
