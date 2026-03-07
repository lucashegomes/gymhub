import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/design-system/themes/theme-provider";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const icon = resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;

  const selectTheme = (nextTheme: Theme) => setTheme(nextTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Alterar tema">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => selectTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Claro {theme === "light" ? "✓" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Escuro {theme === "dark" ? "✓" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectTheme("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          Sistema {theme === "system" ? "✓" : ""}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
