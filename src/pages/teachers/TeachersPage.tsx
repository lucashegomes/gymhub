import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocalStorageCrud } from "@/hooks/useLocalStorageCrud";
import { TablePagination } from "@/components/tables/TablePagination";
import type { Teacher } from "@/types";

const schema = z.object({
  name: z.string().min(3),
  cpf: z.string().min(11),
  email: z.string().email(),
  phone: z.string().min(8),
  specialty: z.string().min(2),
  pricePerClass: z.coerce.number().positive(),
});

type FormData = z.infer<typeof schema>;

const TeachersPage = () => {
  usePageTitle("Professores");
  const { items, create, update, remove } = useLocalStorageCrud<Teacher>("gymhub:teachers");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Teacher>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: "", cpf: "", email: "", phone: "", specialty: "", pricePerClass: 0 } });

  const processed = useMemo(() => {
    const filtered = items.filter((t) => `${t.name} ${t.cpf} ${t.email} ${t.phone} ${t.specialty}`.toLowerCase().includes(search.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const result = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), "pt-BR");
      return sortDirection === "asc" ? result : -result;
    });
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    return { data: sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), totalPages, currentPage, total: sorted.length };
  }, [items, page, search, sortDirection, sortKey]);

  const onSortChange = (key: string) => {
    const typed = key as keyof Teacher;
    if (typed === sortKey) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(typed); setSortDirection("asc"); }
  };

  const submit = form.handleSubmit((values) => {
    if (editing) update(editing.id, values); else create(values);
    setOpen(false);
  });

  const columns: Column<Teacher>[] = [
    { key: "name", header: "Nome", sortable: true },
    { key: "cpf", header: "CPF", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "specialty", header: "Especialidade", sortable: true },
    { key: "pricePerClass", header: "Preço/Aula", sortable: true, render: (t) => `R$ ${t.pricePerClass.toFixed(2)}` },
    { key: "actions", header: "Ações", render: (t) => <div className="flex gap-2" onClick={(e) => e.stopPropagation()}><Button size="icon" variant="outline" onClick={() => { setEditing(t); form.reset(t); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];

  return (
    <AppLayout>
      <PageHeader title="Professores" description="CRUD completo de professores" breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Professores" }]} actions={<Button size="sm" onClick={() => { setEditing(null); form.reset(); setOpen(true); }}><Plus className="mr-1.5 h-4 w-4" />Novo Professor</Button>} />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar professor..." className="max-w-sm" /></div>
      <DataTable columns={columns} data={processed.data} sortKey={sortKey} sortDirection={sortDirection} onSortChange={onSortChange} />
      <TablePagination page={processed.currentPage} totalPages={processed.totalPages} total={processed.total} onPageChange={setPage} />
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar professor" : "Novo professor"}</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-3">{(["name", "cpf", "email", "phone", "specialty", "pricePerClass"] as const).map((field) => <div key={field}><Label>{field}</Label><Input type={field === "email" ? "email" : field === "pricePerClass" ? "number" : "text"} step={field === "pricePerClass" ? "0.01" : undefined} {...form.register(field)} /><p className="text-xs text-destructive">{form.formState.errors[field]?.message}</p></div>)}<Button type="submit" className="w-full">Salvar</Button></form></DialogContent></Dialog>
    </AppLayout>
  );
};

export default TeachersPage;
