"use client"

import { useState } from "react"
import { WeddingHeader } from "@/components/wedding/wedding-header"
import { PhotoUploadForm } from "@/components/wedding/photo-upload-form"
import { PhotoGallery } from "@/components/wedding/photo-gallery"

export default function WeddingPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    // Scroll suavemente a la galeria
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main className="min-h-screen bg-background">

      {/* Hero con petales */}
      <WeddingHeader />

      {/* Seccion de subida */}
      <section className="max-w-xl mx-auto px-4 pb-20 -mt-6">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground font-sans font-medium mb-3">
            Comparte tu recuerdo
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-border/60" />
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-primary/40" fill="currentColor" aria-hidden="true">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
            <span className="h-px w-10 bg-border/60" />
          </div>
        </div>

        <PhotoUploadForm onUploadSuccess={handleUploadSuccess} />
      </section>

      {/* Divisor decorativo */}
      <div className="relative py-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 50% 100% at 50% 50%, oklch(0.88 0.06 10 / 0.08) 0%, transparent 70%)"
        }} />
        <div className="flex items-center justify-center gap-6 relative z-10">
          <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-border/50" />
          <div className="flex items-center gap-3">
            <span className="text-primary/30 text-xs">✦</span>
            <span className="font-serif italic text-muted-foreground text-sm tracking-wide">momentos compartidos</span>
            <span className="text-primary/30 text-xs">✦</span>
          </div>
          <span className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-border/50" />
        </div>
      </div>

      {/* Galeria */}
      <section id="gallery" className="max-w-5xl mx-auto px-4 pb-28 pt-8">
        <PhotoGallery refreshTrigger={refreshTrigger} />
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-10 bg-border/50" />
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary/30" fill="currentColor" aria-hidden="true">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
          </svg>
          <span className="h-px w-10 bg-border/50" />
        </div>
        <p className="font-serif italic text-base text-muted-foreground leading-relaxed">
          Gracias por ser parte de este momento
        </p>
        <p className="text-xs tracking-widest uppercase text-muted-foreground/50 font-sans mt-2">
          Con todo nuestro amor
        </p>
      </footer>
    </main>
  )
}
