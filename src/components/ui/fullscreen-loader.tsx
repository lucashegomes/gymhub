import { Loader2 } from "lucide-react";

interface FullscreenLoaderProps {
  message?: string;
}

export function FullscreenLoader({ message = "Carregando..." }: FullscreenLoaderProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

