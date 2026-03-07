import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

interface Option {
  value: string;
  label: string;
  meta?: Record<string, unknown>;
}

interface AsyncComboboxProps {
  endpoint: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  mapOption?: (item: Record<string, unknown>) => Option;
}

interface AsyncMultiComboboxProps {
  endpoint: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  mapOption?: (item: Record<string, unknown>) => Option;
}

function defaultMapOption(item: Record<string, unknown>): Option {
  return {
    value: String(item.id || ""),
    label: String(item.name || item.label || item.email || item.id || ""),
    meta: item,
  };
}

function useRemoteOptions(endpoint: string, open: boolean, query: string, mapOption?: (item: Record<string, unknown>) => Option) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem("gymhub:auth:token") || "";
    const [basePath, rawQuery = ""] = endpoint.split("?");
    const params = new URLSearchParams(rawQuery);
    params.set("page", "1");
    params.set("pageSize", "20");
    if (query.trim()) params.set("search", query.trim());
    else params.delete("search");

    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`${API_BASE_URL}${basePath}?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json() as Promise<{ data: Record<string, unknown>[] }>;
        })
        .then((payload) => {
          const mapper = mapOption || defaultMapOption;
          setOptions((payload.data || []).map((item) => mapper(item)));
        })
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [endpoint, mapOption, open, query]);

  return { options, loading };
}

export function AsyncCombobox({
  endpoint,
  value,
  onChange,
  placeholder = "Selecione",
  searchPlaceholder = "Pesquisar...",
  mapOption,
}: AsyncComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { options, loading } = useRemoteOptions(endpoint, open, query, mapOption);
  const selected = useMemo(() => options.find((option) => option.value === value), [options, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" className="w-full justify-between">
          {selected?.label || (value ? "Selecionado" : placeholder)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{loading ? "Carregando..." : "Nenhum resultado."}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function AsyncMultiCombobox({
  endpoint,
  value,
  onChange,
  placeholder = "Selecione",
  searchPlaceholder = "Pesquisar...",
  mapOption,
}: AsyncMultiComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { options, loading } = useRemoteOptions(endpoint, open, query, mapOption);
  const selectedLabels = useMemo(
    () => options.filter((option) => value.includes(option.value)).map((option) => option.label),
    [options, value],
  );

  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((id) => id !== optionValue));
      return;
    }
    onChange([...value, optionValue]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" className="w-full justify-between">
          {selectedLabels.length ? selectedLabels.join(", ") : value.length ? `${value.length} selecionado(s)` : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{loading ? "Carregando..." : "Nenhum resultado."}</CommandEmpty>
            {options.map((option) => (
              <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                <Check className={cn("mr-2 h-4 w-4", value.includes(option.value) ? "opacity-100" : "opacity-0")} />
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
