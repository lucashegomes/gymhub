import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Student } from "@/types";

const mockStudents: Student[] = [
  { id: "1", name: "Maria Silva", email: "maria@email.com", phone: "11999990001", cpf: "12345678901", birthDate: "1995-03-15", planType: "Premium", status: "active", createdAt: "2025-01-10" },
  { id: "2", name: "João Santos", email: "joao@email.com", phone: "11999990002", cpf: "12345678902", birthDate: "1990-07-22", planType: "Básico", status: "active", createdAt: "2025-02-05" },
  { id: "3", name: "Ana Costa", email: "ana@email.com", phone: "11999990003", cpf: "12345678903", birthDate: "1988-11-30", planType: "Premium", status: "inactive", createdAt: "2024-06-20" },
  { id: "4", name: "Pedro Lima", email: "pedro@email.com", phone: "11999990004", cpf: "12345678904", birthDate: "2000-01-05", planType: "Básico", status: "inactive", createdAt: "2025-03-01" },
];

const statusMap: Record<string, "success" | "inactive"> = {
  active: "success",
  inactive: "inactive",
};
const statusLabel: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

const columns: Column<Student>[] = [
  { key: "name", header: "Nome" },
  { key: "email", header: "Email" },
  { key: "planType", header: "Plano" },
  {
    key: "status",
    header: "Status",
    render: (s) => <Badge variant={statusMap[s.status]}>{statusLabel[s.status]}</Badge>,
  },
];

const StudentsPage = () => {
  usePageTitle("Alunos");
  const [search, setSearch] = useState("");

  const filtered = mockStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos da academia"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Alunos" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Novo Aluno</Button>}
      />
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar aluno..." className="max-w-sm" />
      </div>
      <DataTable columns={columns} data={filtered} />
    </AppLayout>
  );
};

export default StudentsPage;
