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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocalStorageCrud } from "@/hooks/useLocalStorageCrud";
import { TablePagination } from "@/components/tables/TablePagination";
import { CrudPageSkeleton } from "@/components/ui/crud-page-skeleton";
import { ExportButton } from "@/components/ui/ExportButton";
import type { Class, Course, Teacher } from "@/types";

const schema = z.object({
  name: z.string().min(2),
  courseId: z.string().min(1),
  teacherId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  capacity: z.coerce.number().int().positive(),
  schedules: z.array(z.object({
    weekday: z.coerce.number().int().min(0).max(6),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
  })).optional(),
});

type FormData = z.infer<typeof schema>;

const ClassesPage = () => {
  usePageTitle("Aulas");
  const { items, create, update, remove, isLoading } = useLocalStorageCrud<Class>("gymhub:classes");
  const { items: courses } = useLocalStorageCrud<Course>("gymhub:courses");
  const { items: teachers } = useLocalStorageCrud<Teacher>("gymhub:teachers");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Class>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Class | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", courseId: "", teacherId: "", date: "", time: "", capacity: 1, schedules: [] },
  });
  const courseName = (id: string) => courses.find((c) => c.id === id)?.name ?? "-";
  const teacherName = (id: string) => teachers.find((t) => t.id === id)?.name ?? "-";

  const processed = useMemo(() => {
    const filtered = items.filter((c) => `${courseName(c.courseId)} ${teacherName(c.teacherId)} ${c.date} ${c.time} ${c.capacity}`.toLowerCase().includes(search.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
      const left = sortKey === "courseId" ? courseName(a.courseId) : sortKey === "teacherId" ? teacherName(a.teacherId) : a[sortKey];
      const right = sortKey === "courseId" ? courseName(b.courseId) : sortKey === "teacherId" ? teacherName(b.teacherId) : b[sortKey];
      const result = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), "pt-BR");
      return sortDirection === "asc" ? result : -result;
    });
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    return { data: sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), totalPages, currentPage, total: sorted.length };
  }, [courses, items, page, search, sortDirection, sortKey, teachers]);

  const columns: Column<Class>[] = [
    { key: "name", header: "Nome", sortable: true },
    { key: "courseId", header: "Curso", sortable: true, render: (c) => courseName(c.courseId) },
    { key: "teacherId", header: "Professor", sortable: true, render: (c) => teacherName(c.teacherId) },
    { key: "date", header: "Data", sortable: true },
    { key: "time", header: "Hora", sortable: true },
    { key: "capacity", header: "Capacidade", sortable: true },
    { key: "actions", header: "Ações", render: (c) => <div className="flex gap-2" onClick={(e) => e.stopPropagation()}><Button size="icon" variant="outline" onClick={() => { setEditing(c); form.reset(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];

  return (
    <AppLayout>
      {isLoading ? (
        <CrudPageSkeleton />
      ) : (
        <>
      <PageHeader
        title="Aulas"
        description="CRUD completo de aulas"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Aulas" }]}
        actions={
          <div className="flex gap-2">
            <ExportButton
              data={processed.data}
              fileName="classes"
              columns={[
                { key: "name", label: "Nome" },
                { key: "date", label: "Data" },
                { key: "time", label: "Hora" },
                { key: "capacity", label: "Capacidade" },
              ]}
            />
            <Button size="sm" onClick={() => { setEditing(null); form.reset(); setOpen(true); }}><Plus className="mr-1.5 h-4 w-4" />Nova Aula</Button>
          </div>
        }
      />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar aula..." className="max-w-sm" /></div>
      <DataTable columns={columns} data={processed.data} sortKey={sortKey} sortDirection={sortDirection} onSortChange={(key) => { const k = key as keyof Class; if (k === sortKey) setSortDirection((d) => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDirection("asc"); } }} />
      <TablePagination page={processed.currentPage} totalPages={processed.totalPages} total={processed.total} onPageChange={setPage} />
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar aula" : "Nova aula"}</DialogTitle></DialogHeader><form onSubmit={form.handleSubmit((v) => { if (editing) update(editing.id, v as any); else create(v as any); setOpen(false); })} className="space-y-3"><div><Label>name</Label><Input {...form.register("name")} /><p className="text-xs text-destructive">{form.formState.errors.name?.message}</p></div><div><Label>courseId</Label><Select value={form.watch("courseId")} onValueChange={(v) => form.setValue("courseId", v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><p className="text-xs text-destructive">{form.formState.errors.courseId?.message}</p></div><div><Label>teacherId</Label><Select value={form.watch("teacherId")} onValueChange={(v) => form.setValue("teacherId", v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select><p className="text-xs text-destructive">{form.formState.errors.teacherId?.message}</p></div><div><Label>date</Label><Input type="date" {...form.register("date")} /><p className="text-xs text-destructive">{form.formState.errors.date?.message}</p></div><div><Label>time</Label><Input type="time" {...form.register("time")} /><p className="text-xs text-destructive">{form.formState.errors.time?.message}</p></div><div><Label>capacity</Label><Input type="number" {...form.register("capacity")} /><p className="text-xs text-destructive">{form.formState.errors.capacity?.message}</p></div><Button type="submit" className="w-full">Salvar</Button></form></DialogContent></Dialog>
        </>
      )}
    </AppLayout>
  );
};

export default ClassesPage;
