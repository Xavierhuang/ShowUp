interface ShowUpLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function ShowUpLogo({
  width = 150,
  height = 30,
  className = "",
}: ShowUpLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Cyberpunk Icon */}
      <div className="relative">
        <svg
          width={height}
          height={height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-cyan-400 neon-glow"
        >
          {/* Outer ring */}
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6"/>
          {/* Inner geometric shape */}
          <polygon points="12,4 18,10 16,12 18,14 12,20 6,14 8,12 6,10" fill="currentColor" opacity="0.8"/>
          {/* Center core */}
          <circle cx="12" cy="12" r="3" fill="url(#cyberGradient)" />
          {/* Data points */}
          <circle cx="12" cy="6" r="1" fill="#fb923c" className="animate-pulse"/>
          <circle cx="18" cy="12" r="1" fill="#8b5cf6" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
          <circle cx="12" cy="18" r="1" fill="#10b981" className="animate-pulse" style={{animationDelay: '1s'}}/>
          <circle cx="6" cy="12" r="1" fill="#f97316" className="animate-pulse" style={{animationDelay: '1.5s'}}/>
          
          <defs>
            <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Floating particles */}
        <div className="absolute -top-1 -right-1 text-xs text-cyan-400 animate-bounce">◊</div>
        <div className="absolute -bottom-1 -left-1 text-xs text-purple-400 animate-pulse">◇</div>
      </div>
      
      {/* Cyberpunk Text */}
      <div className="cyber-heading tracking-wider" style={{ fontSize: `${height * 0.8}px` }}>
        <span className="relative">
          SHOW
          <span className="absolute -top-1 -right-1 text-xs text-cyan-400 opacity-60">◊</span>
        </span>
        <span className="mx-1 text-orange-400 text-sm">⚡</span>
        <span className="relative">
          UP
          <span className="absolute -bottom-1 -right-1 text-xs text-purple-400 opacity-60">◇</span>
        </span>
      </div>
    </div>
  );
}
