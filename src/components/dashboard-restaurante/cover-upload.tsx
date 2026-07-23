"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ImagePlus, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadRestaurantPhotoAction } from "@/actions/restaurants/upload-photo";
import { updateRestaurantPhotosAction } from "@/actions/restaurants/update-restaurant-photos";

export function CoverUpload({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const { execute: upload, isExecuting: isUploading } = useAction(uploadRestaurantPhotoAction, {
    onSuccess({ data }) {
      if (!data) return;
      setUrl(data.url);
      save({ coverBlobUrl: data.url });
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo subir la imagen.");
    },
  });

  const { execute: save } = useAction(updateRestaurantPhotosAction, {
    onSuccess() {
      toast.success("Foto de portada actualizada.");
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo guardar la foto.");
    },
  });

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">Foto de portada</p>
      <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-secondary">
        {url ? (
          <Image src={url} alt="Portada" fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <UtensilsCrossed className="size-8 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload({ file, kind: "cover" });
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 gap-2"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="size-4" />
        {isUploading ? "Subiendo..." : "Cambiar portada"}
      </Button>
    </div>
  );
}
