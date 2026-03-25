"use client"

import { useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Camera, Upload, X, User, ImagePlus } from "lucide-react"
import Image from "next/image"

interface PhotoUploadFormProps {
  onUploadSuccess?: () => void
}

export function PhotoUploadForm({ onUploadSuccess }: PhotoUploadFormProps) {
  const [guestName, setGuestName] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const addFiles = useCallback((files: File[]) => {
    const remaining = 10 - selectedFiles.length
    const newFiles = files.slice(0, remaining)
    setSelectedFiles(prev => [...prev, ...newFiles])
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }, [selectedFiles.length])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) addFiles(files)
    e.target.value = ""
  }, [addFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    if (files.length) addFiles(files)
  }, [addFiles])

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim()) { toast.error("Por favor, escribe tu nombre"); return }
    if (!selectedFiles.length) { toast.error("Selecciona al menos una foto"); return }
    setIsUploading(true)

    try {
      const { data: guestData, error: guestError } = await supabase
        .from("wedding_guests")
        .insert({ name: guestName.trim() })
        .select()
        .single()
      if (guestError) throw guestError

      for (const file of selectedFiles) {
        const ext = file.name.split(".").pop()
        const fileName = `${guestData.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from("wedding-photos").upload(fileName, file)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from("wedding-photos").getPublicUrl(fileName)
        const { error: photoError } = await supabase.from("wedding_photos").insert({ guest_id: guestData.id, image_url: urlData.publicUrl })
        if (photoError) throw photoError
      }

      toast.success(`${selectedFiles.length} foto${selectedFiles.length > 1 ? "s compartidas" : " compartida"} con amor`)
      setGuestName("")
      setSelectedFiles([])
      setPreviews([])
      onUploadSuccess?.()
    } catch (err) {
      console.error(err)
      toast.error("Algo fue mal. Intentalo de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  const canSubmit = !isUploading && selectedFiles.length > 0 && guestName.trim().length > 0

  return (
    <div className="animate-scale-in">
      {/* Glass card */}
      <div
        className="relative rounded-2xl overflow-hidden border border-border/60"
        style={{
          background: "oklch(0.998 0.003 80 / 0.75)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 48px -8px oklch(0.48 0.07 10 / 0.10), 0 1px 2px oklch(0.48 0.07 10 / 0.06)",
        }}
      >
        {/* Top accent line */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, oklch(0.74 0.09 78 / 0.6), transparent)" }} />

        <form onSubmit={handleSubmit} className="p-7 sm:p-9 space-y-7">

          {/* Section title */}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border/60" />
            <span className="font-serif text-sm italic text-muted-foreground tracking-wide">Sube tus fotos</span>
            <span className="h-px flex-1 bg-border/60" />
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <label htmlFor="guestName" className="text-xs tracking-widest uppercase text-muted-foreground font-sans font-medium">
              Tu nombre
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
              <input
                id="guestName"
                type="text"
                placeholder="Como quieres que te recuerden"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                disabled={isUploading}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/40 transition-all"
              />
            </div>
          </div>

          {/* Drop zone */}
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground font-sans font-medium">
              Fotografias
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                isDragging
                  ? "border-primary/60 bg-primary/5 scale-[1.01]"
                  : "border-border/70 bg-background/50 hover:border-primary/40 hover:bg-primary/[0.03]"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading || selectedFiles.length >= 10}
              />
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.48 0.07 10 / 0.08)" }}
                >
                  <Camera className="h-6 w-6 text-primary/70" />
                </div>
                <div>
                  <p className="font-serif text-base text-foreground/80">
                    {isDragging ? "Suelta aqui" : "Arrastra o toca para elegir"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-sans">
                    Hasta {10 - selectedFiles.length} foto{10 - selectedFiles.length !== 1 ? "s" : ""} mas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group animate-scale-in">
                  <Image src={src} alt={`Vista previa ${i + 1}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-200" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    disabled={isUploading}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-foreground/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Eliminar foto"
                  >
                    <X className="h-3 w-3 text-background" />
                  </button>
                </div>
              ))}
              {selectedFiles.length < 10 && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border/60 flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                  aria-label="Anadir mas fotos"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-4 rounded-xl font-sans text-sm tracking-widest uppercase font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSubmit
                ? "linear-gradient(135deg, oklch(0.48 0.07 10), oklch(0.55 0.08 20))"
                : "oklch(0.87 0.016 78)",
              color: canSubmit ? "oklch(0.99 0.003 80)" : "oklch(0.50 0.012 55)",
              boxShadow: canSubmit ? "0 4px 24px -4px oklch(0.48 0.07 10 / 0.35)" : "none",
            }}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Compartiendo...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                {selectedFiles.length > 0
                  ? `Compartir ${selectedFiles.length} foto${selectedFiles.length > 1 ? "s" : ""}`
                  : "Compartir fotos"}
              </span>
            )}
          </button>
        </form>

        {/* Bottom accent line */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, oklch(0.74 0.09 78 / 0.4), transparent)" }} />
      </div>
    </div>
  )
}
