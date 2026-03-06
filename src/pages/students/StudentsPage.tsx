import { useMemo, useState } from "react";
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
import type { Student } from "@/types";

const schema = z.object({
  name: z.string().min(3),
  cpf: z.string().min(11),
  email: z.string().email(),
  phone: z.string().min(8),
  birthDate: z.string().min(1),
  planType: z.string().min(2),
  status: z.enum(["active", "inactive", "suspended"]),
});

type FormData = z.infer<typeof schema>;

const statusLabel = { active: "Ativo", inactive: "Inativo", suspended: "Suspenso" };
const statusVariant = { active: "success", inactive: "inactive", suspended: "warning" } as const;

const StudentsPage = () => {
  usePageTitle("Alunos");
  const { items, create, update, remove } = useLocalStorageCrud<Student>("gymhub:students");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Student>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", cpf: "", email: "", phone: "", birthDate: "", planType: "", status: "active" },
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
    form.reset({ name: "", cpf: "", email: "", phone: "", birthDate: "", planType: "", status: "active" });
    setOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    form.reset(student);
    setOpen(true);
  };

  const submit = form.handleSubmit((values) => {
    if (editing) update(editing.id, values);
    else create(values);
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
      <PageHeader
        title="Alunos"
        description="CRUD completo de alunos"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Alunos" }]}
        actions={<Button size="sm" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" />Novo Aluno</Button>}
      />
      <div className="mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar aluno..." className="max-w-sm" />
      </div>
      <DataTable columns={columns} data={processed.data} sortKey={sortKey} sortDirection={sortDirection} onSortChange={onSortChange} />
      <TablePagination page={processed.currentPage} totalPages={processed.totalPages} total={processed.total} onPageChange={setPage} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar aluno" : "Novo aluno"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            {(["name", "cpf", "email", "phone", "birthDate", "planType"] as const).map((field) => (
              <div key={field}>
                <Label>{field}</Label>
                <Input type={field === "birthDate" ? "date" : field === "email" ? "email" : "text"} {...form.register(field)} />
                <p className="text-xs text-destructive">{form.formState.errors[field]?.message}</p>
              </div>
            ))}
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
    </AppLayout>
  );
};

export default StudentsPage;
