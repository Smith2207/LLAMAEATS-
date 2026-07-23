"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { uploadRestaurantPhotoAction } from "@/actions/restaurants/upload-photo";
import { updateRestaurantPhotosAction } from "@/actions/restaurants/update-restaurant-photos";

export function GalleryUpload({ initialUrls }: { initialUrls: string[] }) {
  const [urls, setUrls] = useState(initialUrls);
  const inputRef = useRef<HTMLInputElement>(null);

  const { execute: save } = useAction(updateRestaurantPhotosAction, {
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo guardar la galería.");
    },
  });

  const { execute: upload, isExecuting: isUploading } = useAction(uploadRestaurantPhotoAction, {
    onSuccess({ data }) {
      if (!data) return;
      const next = [...urls, data.url];
      setUrls(next);
      save({ gallery: next });
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo subir la imagen.");
    },
  });

  function removeAt(index: number) {
    const next = urls.filter((_, i) => i !== index);
    setUrls(next);
    save({ gallery: next });
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">Galería de fotos</p>
      <div className="flex flex-wrap gap-3">
        {urls.map((url, i) => (
          <div key={url} className="relative size-24 overflow-hidden rounded-lg bg-secondary">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={isUploading || urls.length >= 12}
          onClick={() => inputRef.current?.click()}
          className="flex size-24 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 disabled:opacity-50"
        >
          <ImagePlus className="size-5" />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload({ file, kind: "gallery" });
        }}
      />
    </div>
  );
}
