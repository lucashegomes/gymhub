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
import { CrudPageSkeleton } from "@/components/ui/crud-page-skeleton";
import { ExportButton } from "@/components/ui/ExportButton";
import type { Course, Teacher } from "@/types";

const schema = z.object({
  name: z.string().min(3),
  teacherId: z.string().optional(),
  teacherIds: z.array(z.string().uuid()).min(1),
  capacity: z.coerce.number().int().positive(),
  description: z.string().min(5),
});

type FormData = z.infer<typeof schema>;

const CoursesPage = () => {
  usePageTitle("Cursos");
  const { items, create, update, remove, isLoading } = useLocalStorageCrud<Course>("gymhub:courses");
  const { items: teachers } = useLocalStorageCrud<Teacher>("gymhub:teachers");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Course>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  const teacherName = (id: string) => teachers.find((t) => t.id === id)?.name ?? "-";
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", teacherId: undefined, teacherIds: [], capacity: 1, description: "" },
  });

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
    {
      key: "teacherId",
      header: "Professores",
      sortable: true,
      render: (c) => (c.teacherIds?.length ? c.teacherIds.map((id) => teacherName(id)).join(", ") : teacherName(c.teacherId)),
    },
    { key: "capacity", header: "Capacidade", sortable: true },
    { key: "description", header: "Descrição", sortable: true },
    { key: "actions", header: "Ações", render: (c) => <div className="flex gap-2" onClick={(e) => e.stopPropagation()}><Button size="icon" variant="outline" onClick={() => { setEditing(c); form.reset(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];

  return (
    <AppLayout>
      {isLoading ? (
        <CrudPageSkeleton />
      ) : (
        <>
      <PageHeader
        title="Cursos"
        description="CRUD completo de cursos"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Cursos" }]}
        actions={
          <div className="flex gap-2">
            <ExportButton
              data={processed.data}
              fileName="courses"
              columns={[
                { key: "name", label: "Nome" },
                { key: "capacity", label: "Capacidade" },
                { key: "description", label: "Descrição" },
              ]}
            />
            <Button size="sm" onClick={() => { setEditing(null); form.reset({ name: "", teacherIds: [], capacity: 1, description: "" } as any); setOpen(true); }}><Plus className="mr-1.5 h-4 w-4" />Novo Curso</Button>
          </div>
        }
      />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar curso..." className="max-w-sm" /></div>
      <DataTable columns={columns} data={processed.data} sortKey={sortKey} sortDirection={sortDirection} onSortChange={onSortChange} />
      <TablePagination page={processed.currentPage} totalPages={processed.totalPages} total={processed.total} onPageChange={setPage} />
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar curso" : "Novo curso"}</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-3"><div><Label>name</Label><Input {...form.register("name")} /><p className="text-xs text-destructive">{form.formState.errors.name?.message}</p></div><div><Label>Professores</Label><div className="max-h-40 overflow-auto rounded-md border p-3 space-y-2">{teachers.map((t) => {const checked = (form.watch("teacherIds") || []).includes(t.id); return (<label key={t.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={() => {const current = form.watch("teacherIds") || []; form.setValue("teacherIds", checked ? current.filter((id) => id !== t.id) : [...current, t.id]);}} />{t.name}</label>);})}</div><p className="text-xs text-destructive">{form.formState.errors.teacherIds?.message}</p></div><div><Label>capacity</Label><Input type="number" {...form.register("capacity")} /><p className="text-xs text-destructive">{form.formState.errors.capacity?.message}</p></div><div><Label>description</Label><Textarea {...form.register("description")} /><p className="text-xs text-destructive">{form.formState.errors.description?.message}</p></div><Button type="submit" className="w-full">Salvar</Button></form></DialogContent></Dialog>
        </>
      )}
    </AppLayout>
  );
};

export default CoursesPage;
