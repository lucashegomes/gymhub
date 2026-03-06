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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocalStorageCrud } from "@/hooks/useLocalStorageCrud";
import { TablePagination } from "@/components/tables/TablePagination";
import type { Course, Teacher } from "@/types";

const schema = z.object({
  name: z.string().min(3),
  teacherId: z.string().min(1),
  capacity: z.coerce.number().int().positive(),
  description: z.string().min(5),
});

type FormData = z.infer<typeof schema>;

const CoursesPage = () => {
  usePageTitle("Cursos");
  const { items, create, update, remove } = useLocalStorageCrud<Course>("gymhub:courses");
  const { items: teachers } = useLocalStorageCrud<Teacher>("gymhub:teachers");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Course>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  const teacherName = (id: string) => teachers.find((t) => t.id === id)?.name ?? "-";
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: "", teacherId: "", capacity: 1, description: "" } });

  const processed = useMemo(() => {
    const filtered = items.filter((c) => `${c.name} ${c.description} ${teacherName(c.teacherId)} ${c.capacity}`.toLowerCase().includes(search.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
      const left = sortKey === "teacherId" ? teacherName(a.teacherId) : a[sortKey];
      const right = sortKey === "teacherId" ? teacherName(b.teacherId) : b[sortKey];
      const result = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), "pt-BR");
      return sortDirection === "asc" ? result : -result;
    });
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    return { data: sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), totalPages, currentPage, total: sorted.length };
  }, [items, page, search, sortDirection, sortKey, teachers]);

  const onSortChange = (key: string) => {
    const typed = key as keyof Course;
    if (typed === sortKey) setSortDirection((d) => (d === "asc" ? "desc" : "asc")); else { setSortKey(typed); setSortDirection("asc"); }
  };

  const submit = form.handleSubmit((values) => { if (editing) update(editing.id, values); else create(values); setOpen(false); });

  const columns: Column<Course>[] = [
    { key: "name", header: "Nome", sortable: true },
    { key: "teacherId", header: "Professor", sortable: true, render: (c) => teacherName(c.teacherId) },
    { key: "capacity", header: "Capacidade", sortable: true },
    { key: "description", header: "Descrição", sortable: true },
    { key: "actions", header: "Ações", render: (c) => <div className="flex gap-2" onClick={(e) => e.stopPropagation()}><Button size="icon" variant="outline" onClick={() => { setEditing(c); form.reset(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];

  return (
    <AppLayout>
      <PageHeader title="Cursos" description="CRUD completo de cursos" breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Cursos" }]} actions={<Button size="sm" onClick={() => { setEditing(null); form.reset(); setOpen(true); }}><Plus className="mr-1.5 h-4 w-4" />Novo Curso</Button>} />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar curso..." className="max-w-sm" /></div>
      <DataTable columns={columns} data={processed.data} sortKey={sortKey} sortDirection={sortDirection} onSortChange={onSortChange} />
      <TablePagination page={processed.currentPage} totalPages={processed.totalPages} total={processed.total} onPageChange={setPage} />
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar curso" : "Novo curso"}</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-3"><div><Label>name</Label><Input {...form.register("name")} /><p className="text-xs text-destructive">{form.formState.errors.name?.message}</p></div><div><Label>teacherId</Label><Select value={form.watch("teacherId")} onValueChange={(v) => form.setValue("teacherId", v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select><p className="text-xs text-destructive">{form.formState.errors.teacherId?.message}</p></div><div><Label>capacity</Label><Input type="number" {...form.register("capacity")} /><p className="text-xs text-destructive">{form.formState.errors.capacity?.message}</p></div><div><Label>description</Label><Textarea {...form.register("description")} /><p className="text-xs text-destructive">{form.formState.errors.description?.message}</p></div><Button type="submit" className="w-full">Salvar</Button></form></DialogContent></Dialog>
    </AppLayout>
  );
};

export default CoursesPage;
