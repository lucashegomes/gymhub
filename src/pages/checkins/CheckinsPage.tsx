import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
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
import { CheckinHistoryModal } from "@/components/modals/CheckinHistoryModal";
import type { Checkin, Class, Student } from "@/types";

const schema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
  checkinTime: z.string().min(1),
  source: z.enum(["manual", "wellhub"]),
});

type FormData = z.infer<typeof schema>;

const CheckinsPage = () => {
  usePageTitle("Check-ins");
  const { items, create, update, remove, isLoading, refresh } = useLocalStorageCrud<Checkin>("gymhub:checkins");
  const { items: students } = useLocalStorageCrud<Student>("gymhub:students");
  const { items: courses } = useLocalStorageCrud<any>("gymhub:courses");
  const { items: classes } = useLocalStorageCrud<Class>("gymhub:classes");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterStudentId, setFilterStudentId] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Checkin>("checkinTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Checkin | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { studentId: "", classId: "", checkinTime: "", source: "manual" } });

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "-";
  const classLabel = (id: string) => {
    const value = classes.find((c) => c.id === id);
    return value ? `${value.date} ${value.time}` : "-";
  };

  const processed = useMemo(() => {
    const filtered = items.filter((c) => {
      if (filterStudentId && c.studentId !== filterStudentId) return false;
      if (filterClassId && c.classId !== filterClassId) return false;
      if (filterCourseId && c.courseId !== filterCourseId) return false;
      if (filterDateFrom && new Date(c.checkinTime) < new Date(filterDateFrom)) return false;
      if (filterDateTo && new Date(c.checkinTime) > new Date(`${filterDateTo}T23:59:59`)) return false;
      return `${studentName(c.studentId)} ${classLabel(c.classId)} ${c.checkinTime} ${c.source}`.toLowerCase().includes(search.toLowerCase());
    });
    const sorted = [...filtered].sort((a, b) => {
      const left = sortKey === "studentId" ? studentName(a.studentId) : sortKey === "classId" ? classLabel(a.classId) : a[sortKey];
      const right = sortKey === "studentId" ? studentName(b.studentId) : sortKey === "classId" ? classLabel(b.classId) : b[sortKey];
      const result = String(left).localeCompare(String(right), "pt-BR");
      return sortDirection === "asc" ? result : -result;
    });
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    return { data: sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), totalPages, currentPage, total: sorted.length };
  }, [classes, items, page, search, sortDirection, sortKey, students]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", "1000");
    if (filterDateFrom) params.set("dateFrom", filterDateFrom);
    if (filterDateTo) params.set("dateTo", filterDateTo);
    if (filterCourseId) params.set("courseId", filterCourseId);
    if (filterClassId) params.set("classId", filterClassId);
    if (filterStudentId) params.set("studentId", filterStudentId);
    if (search) params.set("search", search);
    void refresh(params.toString());
  }, [filterDateFrom, filterDateTo, filterCourseId, filterClassId, filterStudentId, refresh, search]);

  const columns: Column<Checkin>[] = [
    { key: "studentId", header: "Aluno", sortable: true, render: (c) => studentName(c.studentId) },
    { key: "classId", header: "Aula", sortable: true, render: (c) => classLabel(c.classId) },
    { key: "checkinTime", header: "Check-in", sortable: true },
    { key: "source", header: "Origem", sortable: true, render: (c) => <Badge variant={c.source === "manual" ? "warning" : "success"}>{c.source}</Badge> },
    { key: "actions", header: "Ações", render: (c) => <div className="flex gap-2" onClick={(e) => e.stopPropagation()}><Button size="icon" variant="outline" onClick={() => { setEditing(c); form.reset(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];

  return (
    <AppLayout>
      {isLoading ? (
        <CrudPageSkeleton />
      ) : (
        <>
      <PageHeader title="Check-ins" description="CRUD completo de check-ins" breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Check-ins" }]} actions={<Button size="sm" onClick={() => { setEditing(null); form.reset(); setOpen(true); }}><Plus className="mr-1.5 h-4 w-4" />Novo Check-in</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar check-in..." className="max-w-sm" />
        <Input type="date" value={filterDateFrom} onChange={(event) => setFilterDateFrom(event.target.value)} className="w-[160px]" />
        <Input type="date" value={filterDateTo} onChange={(event) => setFilterDateTo(event.target.value)} className="w-[160px]" />
        <Select value={filterCourseId} onValueChange={setFilterCourseId}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Curso" /></SelectTrigger>
          <SelectContent>{courses.map((course: any) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterClassId} onValueChange={setFilterClassId}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Aula" /></SelectTrigger>
          <SelectContent>{classes.map((cls) => <SelectItem key={cls.id} value={cls.id}>{classLabel(cls.id)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterStudentId} onValueChange={setFilterStudentId}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Aluno" /></SelectTrigger>
          <SelectContent>{students.map((student) => <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setFilterDateFrom(""); setFilterDateTo(""); setFilterCourseId(""); setFilterClassId(""); setFilterStudentId(""); }}>Limpar</Button>
        <Button variant="outline" disabled={!filterStudentId} onClick={() => { setSelectedStudentId(filterStudentId); setHistoryOpen(true); }}>
          Check-in History
        </Button>
        <ExportButton
          data={processed.data}
          fileName="checkins"
          columns={[
            { key: "studentName", label: "Aluno" },
            { key: "courseName", label: "Curso" },
            { key: "className", label: "Aula" },
            { key: "checkinTime", label: "Data" },
            { key: "source", label: "Origem" },
          ]}
        />
      </div>
      <DataTable columns={columns} data={processed.data} sortKey={sortKey} sortDirection={sortDirection} onSortChange={(key) => { const k = key as keyof Checkin; if (k === sortKey) setSortDirection((d) => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDirection("asc"); } }} />
      <TablePagination page={processed.currentPage} totalPages={processed.totalPages} total={processed.total} onPageChange={setPage} />
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar check-in" : "Novo check-in"}</DialogTitle></DialogHeader><form onSubmit={form.handleSubmit((v) => { if (editing) update(editing.id, v as any); else create(v as any); setOpen(false); })} className="space-y-3"><div><Label>studentId</Label><Select value={form.watch("studentId")} onValueChange={(v) => form.setValue("studentId", v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><p className="text-xs text-destructive">{form.formState.errors.studentId?.message}</p></div><div><Label>classId</Label><Select value={form.watch("classId")} onValueChange={(v) => form.setValue("classId", v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.date} {c.time}</SelectItem>)}</SelectContent></Select><p className="text-xs text-destructive">{form.formState.errors.classId?.message}</p></div><div><Label>checkinTime</Label><Input type="datetime-local" {...form.register("checkinTime")} /><p className="text-xs text-destructive">{form.formState.errors.checkinTime?.message}</p></div><div><Label>source</Label><Select value={form.watch("source")} onValueChange={(v) => form.setValue("source", v as FormData["source"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">manual</SelectItem><SelectItem value="wellhub">wellhub</SelectItem></SelectContent></Select></div><Button type="submit" className="w-full">Salvar</Button></form></DialogContent></Dialog>
      <CheckinHistoryModal
        open={historyOpen}
        studentId={selectedStudentId}
        studentName={studentName(selectedStudentId)}
        onOpenChange={setHistoryOpen}
      />
        </>
      )}
    </AppLayout>
  );
};

export default CheckinsPage;
