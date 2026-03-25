"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, ChevronLeft, ChevronRight, ImageIcon, Trash2, AlertTriangle } from "lucide-react"
import Image from "next/image"

interface Photo {
  id: string
  image_url: string
  created_at: string
  guest: { id: string; name: string }
}

interface PhotoGalleryProps {
  refreshTrigger?: number
}

const ASPECT_PATTERNS = ["aspect-[3/4]", "aspect-[4/3]", "aspect-square", "aspect-[3/4]", "aspect-[2/3]", "aspect-[4/3]"]

export function PhotoGallery({ refreshTrigger }: PhotoGalleryProps) {
  const [photos, setPhotos]               = useState<Photo[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deleteId, setDeleteId]           = useState<string | null>(null)
  const [isDeleting, setIsDeleting]       = useState(false)
  const supabase = createClient()

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("wedding_photos")
        .select(`id, image_url, created_at, guest:wedding_guests!guest_id (id, name)`)
        .order("created_at", { ascending: false })
      if (error) throw error
      const transformed = (data || []).map(item => ({
        ...item,
        guest: Array.isArray(item.guest) ? item.guest[0] : item.guest,
      }))
      setPhotos(transformed as Photo[])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchPhotos() }, [fetchPhotos, refreshTrigger])

  useEffect(() => {
    const channel = supabase
      .channel("wedding_photos_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "wedding_photos" }, fetchPhotos)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchPhotos])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightboxIndex(i => i !== null ? Math.min(i + 1, photos.length - 1) : null)
      if (e.key === "ArrowLeft")  setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null)
      if (e.key === "Escape")     setLightboxIndex(null)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lightboxIndex, photos.length])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const photo = photos.find(p => p.id === deleteId)
      if (photo) {
        // Extract storage path from URL
        const url = new URL(photo.image_url)
        const pathParts = url.pathname.split("/wedding-photos/")
        if (pathParts[1]) {
          await supabase.storage.from("wedding-photos").remove([pathParts[1]])
        }
      }
      await supabase.from("wedding_photos").delete().eq("id", deleteId)
      setPhotos(prev => prev.filter(p => p.id !== deleteId))
      if (lightboxIndex !== null) {
        const idx = photos.findIndex(p => p.id === deleteId)
        if (idx === lightboxIndex) setLightboxIndex(null)
        else if (idx < lightboxIndex) setLightboxIndex(lightboxIndex - 1)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid rounded-xl bg-secondary animate-pulse"
            style={{ height: `${140 + (i % 3) * 80}px` }}
          />
        ))}
      </div>
    )
  }

  if (!photos.length) {
    return (
      <div className="py-24 flex flex-col items-center gap-5 text-center">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.48 0.07 10 / 0.07)" }}
        >
          <ImageIcon className="h-8 w-8 text-primary/50" />
        </div>
        <div>
          <p className="font-serif text-xl text-foreground/70">Aun no hay recuerdos aqui</p>
          <p className="text-sm text-muted-foreground mt-1 font-sans">Se el primero en compartir un momento</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Count badge */}
      <div className="flex items-center justify-center mb-8 gap-4">
        <span className="h-px flex-1 max-w-[80px] bg-border/60" />
        <span className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
          {photos.length} {photos.length === 1 ? "momento" : "momentos"}
        </span>
        <span className="h-px flex-1 max-w-[80px] bg-border/60" />
      </div>

      {/* Masonry grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group animate-fade-in"
            style={{ animationDelay: `${(index % 8) * 0.06}s` }}
          >
            <div className={`relative ${ASPECT_PATTERNS[index % ASPECT_PATTERNS.length]} rounded-xl overflow-hidden bg-secondary`}>
              <Image
                src={photo.image_url}
                alt={`Foto de ${photo.guest?.name ?? "invitado"}`}
                fill
                onClick={() => setLightboxIndex(index)}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{ background: "linear-gradient(to top, oklch(0.20 0.016 50 / 0.72) 0%, transparent 55%)" }}
              />
              {/* Guest name */}
              <div
                onClick={() => setLightboxIndex(index)}
                className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
              >
                <p className="text-xs font-sans text-white/90 truncate tracking-wide">
                  {photo.guest?.name ?? "Invitado"}
                </p>
              </div>
              {/* Delete button */}
              <button
                onClick={e => { e.stopPropagation(); setDeleteId(photo.id) }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 hover:bg-destructive/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                aria-label="Eliminar foto"
              >
                <Trash2 className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0.10 0.01 50 / 0.70)", backdropFilter: "blur(8px)" }}
          onClick={() => !isDeleting && setDeleteId(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-7 animate-scale-in shadow-2xl"
            style={{ background: "oklch(0.998 0.003 80)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.577 0.245 27.325 / 0.10)" }}
              >
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
            </div>

            <h3 className="font-serif text-xl text-center text-foreground mb-2">
              Eliminar foto
            </h3>
            <p className="text-sm text-muted-foreground text-center font-sans leading-relaxed mb-7">
              Esta accion no se puede deshacer. La foto se eliminara permanentemente.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-xl border border-border font-sans text-sm text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-xl font-sans text-sm text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "oklch(0.48 0.22 25)" }}
              >
                {isDeleting ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "oklch(0.10 0.01 50 / 0.92)", backdropFilter: "blur(12px)" }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Delete from lightbox */}
          <button
            onClick={e => { e.stopPropagation(); setDeleteId(photos[lightboxIndex].id); setLightboxIndex(null) }}
            className="absolute top-5 right-20 h-10 w-10 rounded-full bg-white/10 hover:bg-destructive/70 flex items-center justify-center transition-colors z-10"
            aria-label="Eliminar foto"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </button>

          {/* Prev */}
          {lightboxIndex > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
              className="absolute left-4 sm:left-8 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          )}

          {/* Next */}
          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
              className="absolute right-4 sm:right-8 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-4xl w-full mx-16 sm:mx-24 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "82vh" }}>
              <Image
                src={photos[lightboxIndex].image_url}
                alt={`Foto de ${photos[lightboxIndex].guest?.name ?? "invitado"}`}
                width={1200}
                height={900}
                className="w-full h-auto object-contain"
                style={{ maxHeight: "75vh" }}
              />
            </div>
            {/* Caption */}
            <div className="mt-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-serif text-white"
                  style={{ background: "oklch(0.48 0.07 10 / 0.7)" }}
                >
                  {(photos[lightboxIndex].guest?.name ?? "I")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white/90 font-sans">
                    {photos[lightboxIndex].guest?.name ?? "Invitado"}
                  </p>
                  <p className="text-xs text-white/50 font-sans">
                    {new Date(photos[lightboxIndex].created_at).toLocaleDateString("es-ES", {
                      day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
              <span className="text-xs text-white/40 font-sans tabular-nums">
                {lightboxIndex + 1} / {photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
