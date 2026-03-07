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
import { Checkbox } from "@/components/ui/checkbox";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocalStorageCrud } from "@/hooks/useLocalStorageCrud";
import { TablePagination } from "@/components/tables/TablePagination";
import { CrudPageSkeleton } from "@/components/ui/crud-page-skeleton";
import { ExportButton } from "@/components/ui/ExportButton";
import { AsyncCombobox } from "@/components/forms/AsyncCombobox";
import type { Class, Course, Teacher } from "@/types";

const schema = z.object({
  name: z.string().min(2),
  courseId: z.string().min(1),
  teacherId: z.string().min(1),
  date: z.string().optional(),
  time: z.string().optional(),
  capacity: z.coerce.number().int().positive(),
  isSingleClass: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
  schedules: z.array(z.object({
    weekday: z.coerce.number().int().min(0).max(6),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
  })).optional(),
}).superRefine((values, ctx) => {
  if (values.isSingleClass) {
    if (!values.startDate || !values.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe data de início e fim para aula única",
        path: ["startDate"],
      });
    }
    return;
  }

  const weekdaysValue = values.weekdays || [];
  if (!weekdaysValue.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecione ao menos um dia da semana",
      path: ["weekdays"],
    });
  }
});

type FormData = z.infer<typeof schema>;

const weekdays = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

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
    defaultValues: {
      name: "",
      courseId: "",
      teacherId: "",
      date: "",
      time: "",
      capacity: 1,
      isSingleClass: false,
      startDate: "",
      endDate: "",
      weekdays: [],
      schedules: [],
    },
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
    { key: "date", header: "Data", sortable: true, render: (c) => c.date || "-" },
    { key: "time", header: "Hora", sortable: true, render: (c) => c.time || "-" },
    { key: "capacity", header: "Capacidade", sortable: true },
    { key: "actions", header: "Ações", render: (c) => <div className="flex gap-2" onClick={(e) => e.stopPropagation()}><Button size="icon" variant="outline" onClick={() => { setEditing(c); form.reset({ ...c, weekdays: (c.schedules || []).map((item) => item.weekday), schedules: c.schedules || [] }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button></div> },
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
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                form.reset({
                  name: "",
                  courseId: "",
                  teacherId: "",
                  date: "",
                  time: "",
                  capacity: 1,
                  isSingleClass: false,
                  startDate: "",
                  endDate: "",
                  weekdays: [],
                  schedules: [],
                });
                setOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Nova Aula
            </Button>
          </div>
        }
      />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar aula..." className="max-w-sm" /></div>
      <DataTable columns={columns} data={processed.data} sortKey={sortKey} sortDirection={sortDirection} onSortChange={(key) => { const k = key as keyof Class; if (k === sortKey) setSortDirection((d) => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDirection("asc"); } }} />
      <TablePagination page={processed.currentPage} totalPages={processed.totalPages} total={processed.total} onPageChange={setPage} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar aula" : "Nova aula"}</DialogTitle></DialogHeader>
          <form
            onSubmit={form.handleSubmit((values) => {
              const selectedWeekdays = values.weekdays || [];
              const schedules = (values.schedules || []).filter((item) => selectedWeekdays.includes(item.weekday));
              const firstSchedule = schedules[0];

              const payload = {
                ...values,
                date: values.isSingleClass ? values.startDate : values.date || new Date().toISOString().slice(0, 10),
                time: firstSchedule?.startTime || values.time || "08:00",
                schedules,
              };

              if (editing) update(editing.id, payload as any);
              else create(payload as any);
              setOpen(false);
            })}
            className="space-y-3"
          >
            <div><Label>Nome</Label><Input {...form.register("name")} /><p className="text-xs text-destructive">{form.formState.errors.name?.message}</p></div>
            <div>
              <Label>Curso</Label>
              <AsyncCombobox endpoint="/courses" value={form.watch("courseId")} onChange={(v) => form.setValue("courseId", v)} searchPlaceholder="Pesquisar curso..." />
              <p className="text-xs text-destructive">{form.formState.errors.courseId?.message}</p>
            </div>
            <div>
              <Label>Professor associado</Label>
              <AsyncCombobox endpoint="/teachers" value={form.watch("teacherId")} onChange={(v) => form.setValue("teacherId", v)} searchPlaceholder="Pesquisar professor..." />
              <p className="text-xs text-destructive">{form.formState.errors.teacherId?.message}</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={!!form.watch("isSingleClass")} onCheckedChange={(checked) => form.setValue("isSingleClass", Boolean(checked))} />
              <Label>Aula única?</Label>
            </div>
            {form.watch("isSingleClass") ? (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Data início</Label><Input type="date" {...form.register("startDate")} /></div>
                <div><Label>Data fim</Label><Input type="date" {...form.register("endDate")} /></div>
              </div>
            ) : null}
            <p className="text-xs text-destructive">{form.formState.errors.startDate?.message || form.formState.errors.weekdays?.message}</p>
            <div>
              <Label>Dias da semana</Label>
              <div className="rounded-md border p-3 space-y-2">
                {weekdays.map((weekday) => {
                  const selected = (form.watch("weekdays") || []).includes(weekday.value);
                  return (
                    <div key={weekday.value} className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(checked) => {
                            const current = form.watch("weekdays") || [];
                            const next = checked
                              ? [...current, weekday.value]
                              : current.filter((value) => value !== weekday.value);
                            form.setValue("weekdays", next);

                            const currentSchedules = form.watch("schedules") || [];
                            const existing = currentSchedules.find((item) => item.weekday === weekday.value);
                            if (checked && !existing) {
                              form.setValue("schedules", [...currentSchedules, { weekday: weekday.value, startTime: "08:00", endTime: "09:00" }]);
                            }
                            if (!checked) {
                              form.setValue("schedules", currentSchedules.filter((item) => item.weekday !== weekday.value));
                            }
                          }}
                        />
                        {weekday.label}
                      </label>
                      {selected ? (
                        <div className="grid grid-cols-2 gap-2 pl-6">
                          <Input
                            type="time"
                            value={(form.watch("schedules") || []).find((item) => item.weekday === weekday.value)?.startTime || "08:00"}
                            onChange={(event) => {
                              const currentSchedules = form.watch("schedules") || [];
                              form.setValue(
                                "schedules",
                                currentSchedules.map((item) =>
                                  item.weekday === weekday.value ? { ...item, startTime: event.target.value } : item,
                                ),
                              );
                            }}
                          />
                          <Input
                            type="time"
                            value={(form.watch("schedules") || []).find((item) => item.weekday === weekday.value)?.endTime || "09:00"}
                            onChange={(event) => {
                              const currentSchedules = form.watch("schedules") || [];
                              form.setValue(
                                "schedules",
                                currentSchedules.map((item) =>
                                  item.weekday === weekday.value ? { ...item, endTime: event.target.value } : item,
                                ),
                              );
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
            <div><Label>Capacidade</Label><Input type="number" {...form.register("capacity")} /><p className="text-xs text-destructive">{form.formState.errors.capacity?.message}</p></div>
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
        </>
      )}
    </AppLayout>
  );
};

export default ClassesPage;
