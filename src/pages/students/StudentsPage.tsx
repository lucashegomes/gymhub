import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, History, Pencil, Plus, Trash2 } from "lucide-react";
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
import { PlanSelector } from "@/components/forms/PlanSelector";
import { GuardianSelector } from "@/components/forms/GuardianSelector";
import { CheckinHistoryModal } from "@/components/modals/CheckinHistoryModal";
import { isValidCpf } from "@/utils/cpf";
import { useNavigate } from "react-router-dom";
import type { Student } from "@/types";

const schema = z.object({
  name: z.string().min(3),
  cpf: z.string().min(11).refine((value) => isValidCpf(value), "CPF inválido"),
  email: z.string().email(),
  phone: z.string().min(8),
  birthDate: z.string().min(1),
  planType: z.string().min(2),
  integrationId: z.string().optional(),
  planId: z.string().uuid().optional(),
  guardianStudentIds: z.array(z.string().uuid()).optional(),
  status: z.enum(["active", "inactive", "suspended"]),
}).superRefine((values, ctx) => {
  const birth = new Date(values.birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const month = now.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) age -= 1;

  if (age < 18 && (!values.guardianStudentIds || values.guardianStudentIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Aluno menor de idade deve possuir responsável",
      path: ["guardianStudentIds"],
    });
  }
});

type FormData = z.infer<typeof schema>;

const statusLabel = { active: "Ativo", inactive: "Inativo", suspended: "Suspenso" };
const statusVariant = { active: "success", inactive: "inactive", suspended: "warning" } as const;

const StudentsPage = () => {
  usePageTitle("Alunos");
  const navigate = useNavigate();
  const { items, create, update, remove, isLoading } = useLocalStorageCrud<Student>("gymhub:students");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Student>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      phone: "",
      birthDate: "",
      planType: "",
      integrationId: "",
      planId: undefined,
      guardianStudentIds: [],
      status: "active",
    },
  });

  const processed = useMemo(() => {
    const filtered = items.filter((s) =>
      `${s.name} ${s.cpf} ${s.email} ${s.phone} ${s.planType} ${s.status}`.toLowerCase().includes(search.toLowerCase()),
    );

    const sorted = [...filtered].sort((a, b) => {
      const left = String(a[sortKey] ?? "");
      const right = String(b[sortKey] ?? "");
      const result = left.localeCompare(right, "pt-BR");
      return sortDirection === "asc" ? result : -result;
    });

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;

    return { data: sorted.slice(start, start + pageSize), totalPages, currentPage, total: sorted.length };
  }, [items, page, search, sortDirection, sortKey]);

  const onSortChange = (key: string) => {
    const typed = key as keyof Student;
    if (typed === sortKey) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(typed);
      setSortDirection("asc");
    }
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      cpf: "",
      email: "",
      phone: "",
      birthDate: "",
      planType: "",
      integrationId: "",
      planId: undefined,
      guardianStudentIds: [],
      status: "active",
    });
    setOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    form.reset({
      ...student,
      integrationId: student.integrationId || "",
      planId: student.planId,
      guardianStudentIds: (student.guardians || []).map((value) => value.guardianStudentId),
    });
    setOpen(true);
  };

  const submit = form.handleSubmit((values) => {
    if (editing) update(editing.id, values as any);
    else create(values as any);
    setOpen(false);
  });

  const columns: Column<Student>[] = [
    { key: "name", header: "Nome", sortable: true },
    { key: "cpf", header: "CPF", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "planType", header: "Plano", sortable: true },
    { key: "status", header: "Status", sortable: true, render: (s) => <Badge variant={statusVariant[s.status]}>{statusLabel[s.status]}</Badge> },
    {
      key: "actions",
      header: "Ações",
      render: (s) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="outline" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="destructive" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      {isLoading ? (
        <CrudPageSkeleton />
      ) : (
        <>
      <PageHeader
        title="Alunos"
        description="CRUD completo de alunos"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Alunos" }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!selectedStudent}
              onClick={() => selectedStudent && navigate(`/checkins?studentId=${selectedStudent.id}`)}
            >
              <ClipboardCheck className="mr-1.5 h-4 w-4" />
              Check-in
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!selectedStudent}
              onClick={() => setHistoryOpen(true)}
            >
              <History className="mr-1.5 h-4 w-4" />
              Check-in History
            </Button>
            <ExportButton
              data={processed.data}
              fileName="students"
              columns={[
                { key: "name", label: "Nome" },
                { key: "cpf", label: "CPF" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Telefone" },
                { key: "status", label: "Status" },
              ]}
            />
            <Button size="sm" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" />Novo Aluno</Button>
          </div>
        }
      />
      <div className="mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar aluno..." className="max-w-sm" />
      </div>
      <DataTable
        columns={columns}
        data={processed.data}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        onRowClick={(student) => setSelectedStudent(student)}
      />
      <TablePagination page={processed.currentPage} totalPages={processed.totalPages} total={processed.total} onPageChange={setPage} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar aluno" : "Novo aluno"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            {(["name", "cpf", "email", "phone", "birthDate", "planType", "integrationId"] as const).map((field) => (
              <div key={field}>
                <Label>{field}</Label>
                <Input type={field === "birthDate" ? "date" : field === "email" ? "email" : "text"} {...form.register(field)} />
                <p className="text-xs text-destructive">{form.formState.errors[field]?.message}</p>
              </div>
            ))}
            <PlanSelector
              value={form.watch("planId")}
              onChange={(value) => form.setValue("planId", value)}
            />
            <GuardianSelector
              value={form.watch("guardianStudentIds") || []}
              onChange={(value) => form.setValue("guardianStudentIds", value)}
            />
            <p className="text-xs text-destructive">{form.formState.errors.guardianStudentIds?.message as string}</p>
            <div>
              <Label>Status</Label>
              <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as FormData["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
      <CheckinHistoryModal
        open={historyOpen}
        studentId={selectedStudent?.id}
        studentName={selectedStudent?.name}
        onOpenChange={setHistoryOpen}
      />
        </>
      )}
    </AppLayout>
  );
};

export default StudentsPage;
