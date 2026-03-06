import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="h-14 flex items-center border-b border-border px-4 bg-card">
      <SidebarTrigger className="mr-2" />
      <Separator orientation="vertical" className="mr-4 h-6" />
      {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
