import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usersService } from "@/services/users/users.service";

interface UserAvatarUploadProps {
  userId: string;
  currentPhotoUrl?: string;
  onUploaded?: (photoUrl: string) => void;
}

export function UserAvatarUpload({ userId, currentPhotoUrl, onUploaded }: UserAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | undefined>(currentPhotoUrl);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPreview(currentPhotoUrl);
  }, [currentPhotoUrl]);

  const onFileSelected = async (file?: File) => {
    if (!file) return;

    const temporaryUrl = URL.createObjectURL(file);
    setPreview(temporaryUrl);
    setLoading(true);

    try {
      const result = await usersService.uploadPhoto(userId, file);
      onUploaded?.(result.data.photoUrl);
      setPreview(result.data.photoUrl || currentPhotoUrl);
    } catch (error) {
      console.error(error);
      setPreview(currentPhotoUrl);
    } finally {
      URL.revokeObjectURL(temporaryUrl);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
        {preview ? <img src={preview} alt="Avatar" className="h-full w-full object-cover" /> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onFileSelected(event.target.files?.[0])}
      />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={loading}>
        {loading ? "Enviando..." : "Enviar foto"}
      </Button>
    </div>
  );
}
