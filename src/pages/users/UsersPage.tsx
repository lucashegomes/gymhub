import { useEffect, useMemo, useState } from "react";
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
import { TablePagination } from "@/components/tables/TablePagination";
import { usersService } from "@/services/users/users.service";
import { UserAvatarUpload } from "@/components/avatar/UserAvatarUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CrudPageSkeleton } from "@/components/ui/crud-page-skeleton";
import { ExportButton } from "@/components/ui/ExportButton";
import { isValidCpf } from "@/utils/cpf";

interface UserRow {
  id: string;
  name: string;
  email: string;
  cpf: string;
  photoUrl?: string;
  roleId: string;
  roleName?: string;
  status: "active" | "inactive" | "blocked";
}

interface RoleRow {
  id: string;
  name: string;
}

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().min(11).refine((value) => isValidCpf(value), "CPF inválido"),
  roleId: z.string().uuid(),
  status: z.enum(["active", "inactive", "blocked"]),
  password: z.string().min(8).optional(),
});

type FormData = z.infer<typeof schema>;

export default function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      roleId: "",
      status: "active",
      password: "",
    },
  });

  const load = async () => {
    const response = await usersService.list(`?page=1&pageSize=200&search=${encodeURIComponent(search)}`);
    setItems(response.data as UserRow[]);
  };

  const loadRoles = async () => {
    const token = localStorage.getItem("gymhub:auth:token");
    const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
    const response = await fetch(`${apiBase}/roles`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to load roles: HTTP ${response.status}`);
    }

    const payload = (await response.json()) as { data: RoleRow[] };
    setRoles(payload.data || []);
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([load(), loadRoles()])
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [search]);

  const processed = useMemo(() => {
    const pageSize = 8;
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;

    return {
      data: items.slice(start, start + pageSize),
      totalPages,
      currentPage,
      total: items.length,
    };
  }, [items, page]);

  const submit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await usersService.update(editing.id, values);
      } else {
        await usersService.create(values);
      }

      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar usuário");
    }
  });

  const remove = async (id: string) => {
    try {
      await usersService.remove(id);
      await load();
    } catch (error) {
      console.error(error);
      alert("Erro ao remover usuário");
    }
  };

  const columns: Column<UserRow>[] = [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    { key: "cpf", header: "CPF" },
    { key: "roleName", header: "Perfil" },
    { key: "status", header: "Status" },
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
              form.reset({
                name: row.name,
                email: row.email,
                cpf: row.cpf,
                roleId: row.roleId,
                status: row.status,
                password: "",
              });
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

  return (
    <AppLayout>
      {isLoading ? (
        <CrudPageSkeleton />
      ) : (
        <>
      <PageHeader
        title="Usuários"
        description="CRUD de usuários e perfis"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Usuários" }]}
        actions={
          <div className="flex gap-2">
            <ExportButton
              data={processed.data}
              fileName="users"
              columns={[
                { key: "name", label: "Nome" },
                { key: "email", label: "Email" },
                { key: "cpf", label: "CPF" },
                { key: "roleName", label: "Perfil" },
                { key: "status", label: "Status" },
              ]}
            />
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                form.reset({ name: "", email: "", cpf: "", roleId: "", status: "active", password: "" });
                setOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />Novo Usuário
            </Button>
          </div>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar usuário..." className="max-w-sm" />
      </div>

      <DataTable columns={columns} data={processed.data} />
      <TablePagination
        page={processed.currentPage}
        totalPages={processed.totalPages}
        total={processed.total}
        onPageChange={setPage}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          </DialogHeader>

          {editing ? (
            <UserAvatarUpload userId={editing.id} currentPhotoUrl={editing.photoUrl} onUploaded={() => load()} />
          ) : null}

          <form className="space-y-3" onSubmit={submit}>
            <div>
              <Label>Nome</Label>
              <Input {...form.register("name")} />
            </div>
            <div>
              <Label>Email</Label>
              <Input {...form.register("email")} />
            </div>
            <div>
              <Label>CPF</Label>
              <Input {...form.register("cpf")} />
            </div>
            <div>
              <Label>Role ID</Label>
              <Select value={form.watch("roleId")} onValueChange={(value) => form.setValue("roleId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Input {...form.register("status")} />
            </div>
            <div>
              <Label>Senha {editing ? "(opcional)" : ""}</Label>
              <Input type="password" {...form.register("password")} />
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
