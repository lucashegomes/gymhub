import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, LogOut, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatarUpload } from "@/components/avatar/UserAvatarUpload";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function buildInitials(name?: string) {
  if (!name) return "GH";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "GH";
}

export function AppHeader() {
  const { user, logout, updateCurrentUser, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = useMemo(() => buildInitials(user?.name), [user?.name]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center border-b border-border bg-card/80 backdrop-blur-sm px-4">
      <SidebarTrigger className="mr-2" />
      <Separator orientation="vertical" className="mr-4 h-6" />
      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoUrl} alt={user?.name || "Usuário"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="space-y-0.5">
              <p className="text-sm font-medium leading-none">{user?.name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || "-"}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <UserCircle2 className="mr-2 h-4 w-4" />
              Ver perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void handleLogout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perfil do usuário</DialogTitle>
          </DialogHeader>
          {user ? (
            <div className="space-y-4">
              <UserAvatarUpload
                userId={user.id}
                currentPhotoUrl={user.photoUrl}
                onUploaded={(photoUrl) => {
                  updateCurrentUser({ photoUrl });
                  void refreshCurrentUser();
                }}
              />
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Nome:</span> {user.name}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">CPF:</span> {user.cpf}</p>
                <p><span className="font-medium">Status:</span> {user.status}</p>
                {user.lastLogin ? <p><span className="font-medium">Último acesso:</span> {new Date(user.lastLogin).toLocaleString("pt-BR")}</p> : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </header>
  );
}
