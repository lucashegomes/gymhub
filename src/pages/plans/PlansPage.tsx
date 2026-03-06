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
import type { Plan } from "@/types";

const schema = z.object({
  name: z.string().min(3),
  price: z.coerce.number().positive(),
  periodicity: z.enum(["monthly", "semiannual", "annual"]),
  monthlyCheckinLimit: z.coerce.number().int().positive(),
});

type FormData = z.infer<typeof schema>;

export default function PlansPage() {
  usePageTitle("Planos");
  const { items, create, update, remove, isLoading } = useLocalStorageCrud<Plan>("gymhub:plans");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", price: 0, periodicity: "monthly", monthlyCheckinLimit: 30 },
  });

  const filtered = useMemo(
    () => items.filter((item) => `${item.name} ${item.periodicity}`.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const processed = useMemo(() => {
    const pageSize = 8;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    return { data: filtered.slice(start, start + pageSize), total: filtered.length, totalPages, currentPage };
  }, [filtered, page]);

  const columns: Column<Plan>[] = [
    { key: "name", header: "Nome" },
    { key: "price", header: "Preço", render: (plan) => `R$ ${Number(plan.price).toFixed(2)}` },
    { key: "periodicity", header: "Periodicidade" },
    { key: "monthlyCheckinLimit", header: "Limite mensal" },
    {
      key: "actions",
      header: "Ações",
      render: (row) => (
        <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setEditing(row);
              form.reset(row);
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="destructive" onClick={() => remove(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const submit = form.handleSubmit(async (values) => {
    if (editing) await update(editing.id, values as Plan);
    else await create(values as Plan);
    setOpen(false);
  });

  return (
    <AppLayout>
      {isLoading ? (
        <CrudPageSkeleton />
      ) : (
        <>
          <PageHeader
            title="Planos"
            description="Cadastro de planos e limites de check-ins"
            breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Planos" }]}
            actions={
              <div className="flex gap-2">
                <ExportButton
                  data={processed.data}
                  fileName="plans"
                  columns={[
                    { key: "name", label: "Nome" },
                    { key: "price", label: "Preço" },
                    { key: "periodicity", label: "Periodicidade" },
                    { key: "monthlyCheckinLimit", label: "Limite mensal" },
                  ]}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    form.reset({ name: "", price: 0, periodicity: "monthly", monthlyCheckinLimit: 30 });
                    setOpen(true);
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Novo Plano
                </Button>
              </div>
            }
          />

          <div className="mb-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar plano..." className="max-w-sm" />
          </div>

          <DataTable columns={columns} data={processed.data} />
          <TablePagination page={processed.currentPage} totalPages={processed.totalPages} total={processed.total} onPageChange={setPage} />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar plano" : "Novo plano"}</DialogTitle>
              </DialogHeader>

              <form className="space-y-3" onSubmit={submit}>
                <div>
                  <Label>Nome</Label>
                  <Input {...form.register("name")} />
                </div>
                <div>
                  <Label>Preço</Label>
                  <Input type="number" step="0.01" {...form.register("price")} />
                </div>
                <div>
                  <Label>Periodicidade</Label>
                  <Select value={form.watch("periodicity")} onValueChange={(value) => form.setValue("periodicity", value as FormData["periodicity"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">monthly</SelectItem>
                      <SelectItem value="semiannual">semiannual</SelectItem>
                      <SelectItem value="annual">annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Limite mensal de check-ins</Label>
                  <Input type="number" {...form.register("monthlyCheckinLimit")} />
                </div>
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AppLayout>
  );
}

