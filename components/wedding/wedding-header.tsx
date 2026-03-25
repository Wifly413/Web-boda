"use client"

import { useEffect, useState } from "react"

interface Petal {
  id: number
  left: number
  delay: number
  size: number
  animClass: string
  color: string
  shape: "round" | "pointed" | "maple" | "heart"
  opacity: number
}

const PETAL_COLORS = [
  "oklch(0.88 0.07 10)",
  "oklch(0.91 0.05 20)",
  "oklch(0.84 0.06 350)",
  "oklch(0.90 0.04 40)",
  "oklch(0.79 0.09 68)",
  "oklch(0.86 0.05 5)",
  "oklch(0.93 0.03 30)",
]

const ANIM_CLASSES = [
  "animate-petal-1","animate-petal-2","animate-petal-3","animate-petal-4",
  "animate-petal-5","animate-petal-6","animate-petal-7","animate-petal-8",
  "animate-petal-9","animate-petal-10","animate-petal-11","animate-petal-12",
]

const SHAPES: Petal["shape"][] = ["round", "pointed", "maple", "heart"]

// SVG paths for different petal shapes
function PetalShape({ shape, color, opacity }: { shape: Petal["shape"], color: string, opacity: number }) {
  const fill = color
  const o = opacity

  if (shape === "round") return (
    <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <ellipse cx="12" cy="16" rx="9" ry="15" fill={fill} fillOpacity={o} />
      <line x1="12" y1="31" x2="12" y2="4" stroke={fill} strokeOpacity={o * 0.4} strokeWidth="0.8"/>
      <line x1="12" y1="14" x2="5" y2="8" stroke={fill} strokeOpacity={o * 0.3} strokeWidth="0.5"/>
      <line x1="12" y1="18" x2="19" y2="10" stroke={fill} strokeOpacity={o * 0.3} strokeWidth="0.5"/>
    </svg>
  )

  if (shape === "pointed") return (
    <svg viewBox="0 0 20 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <path d="M10 1 C18 10, 20 20, 10 35 C0 20, 2 10, 10 1Z" fill={fill} fillOpacity={o} />
      <line x1="10" y1="2" x2="10" y2="34" stroke={fill} strokeOpacity={o * 0.35} strokeWidth="0.7"/>
    </svg>
  )

  if (shape === "maple") return (
    <svg viewBox="0 0 28 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <path d="M14 1 L17 9 L24 7 L19 13 L28 15 L20 18 L22 26 L14 22 L6 26 L8 18 L0 15 L9 13 L4 7 L11 9 Z" fill={fill} fillOpacity={o}/>
      <line x1="14" y1="22" x2="14" y2="29" stroke={fill} strokeOpacity={o * 0.5} strokeWidth="1.2"/>
    </svg>
  )

  // heart
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <path d="M12 21C12 21 3 13.5 3 8C3 5.24 5.24 3 8 3C9.64 3 11.09 3.82 12 5.08C12.91 3.82 14.36 3 16 3C18.76 3 21 5.24 21 8C21 13.5 12 21 12 21Z" fill={fill} fillOpacity={o}/>
    </svg>
  )
}

export function WeddingHeader() {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    const generated: Petal[] = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: Math.random() * 105 - 2.5,
      delay: Math.random() * 16,
      size: 7 + Math.random() * 14,
      animClass: ANIM_CLASSES[i % ANIM_CLASSES.length],
      color: PETAL_COLORS[i % PETAL_COLORS.length],
      shape: SHAPES[i % SHAPES.length],
      opacity: 0.45 + Math.random() * 0.35,
    }))
    setPetals(generated)
  }, [])

  return (
    <header className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4">

      {/* Subtle radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 38%, oklch(0.88 0.06 10 / 0.10) 0%, transparent 72%)",
        }}
      />

      {/* Falling petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {petals.map((p) => (
          <div
            key={p.id}
            className={`absolute ${p.animClass}`}
            style={{
              left: `${p.left}%`,
              top: "-60px",
              animationDelay: `${p.delay}s`,
              width: `${p.size}px`,
              height: `${p.size * (p.shape === "maple" ? 1.0 : p.shape === "heart" ? 1.0 : 1.5)}px`,
              filter: "blur(0.2px)",
            }}
          >
            <PetalShape shape={p.shape} color={p.color} opacity={p.opacity} />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">

        {/* Top ornament */}
        <div className="animate-fade-in flex items-center gap-4 mb-10">
          <span className="block h-px bg-foreground/20" style={{ width: "2.5rem" }} />
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary/60" fill="currentColor" aria-hidden="true">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
          </svg>
          <span className="block h-px bg-foreground/20" style={{ width: "2.5rem" }} />
        </div>

        {/* Kicker */}
        <p className="animate-fade-in animate-delay-200 text-[10px] sm:text-xs tracking-[0.35em] uppercase text-muted-foreground font-sans font-medium mb-6">
          Galeria de momentos
        </p>

        {/* Main heading */}
        <h1 className="animate-fade-in-up animate-delay-300 font-serif text-5xl sm:text-7xl md:text-8xl font-light leading-none tracking-tight text-foreground mb-6 text-balance">
          Galeria de{" "}
          <em className="not-italic">Momentos</em>
        </h1>

        {/* Divider */}
        <div className="animate-fade-in animate-delay-400 flex items-center gap-4 my-2">
          <span className="block h-px w-12 bg-foreground/15" />
          <span className="block h-1 w-1 rounded-full bg-primary/40" />
          <span className="block h-px w-12 bg-foreground/15" />
        </div>

        {/* Subtitle */}
        <p className="animate-fade-in-up animate-delay-500 font-serif text-lg sm:text-xl font-light text-muted-foreground leading-relaxed max-w-md mt-4 text-balance">
          Comparte tus fotografias y revive cada instante de este dia tan especial
        </p>

        {/* Scroll cue */}
        <div className="animate-fade-in animate-delay-900 mt-14 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-sans">Comenzar</span>
          <div className="h-10 w-px bg-gradient-to-b from-border to-transparent" />
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, oklch(0.975 0.010 80))" }}
      />
    </header>
  )
}
