import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { GraduationCap, Plus } from "lucide-react";

const TeachersPage = () => {
  usePageTitle("Professores");
  return (
    <AppLayout>
      <PageHeader
        title="Professores"
        description="Gerencie o corpo docente"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Professores" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Novo Professor</Button>}
      />
      <EmptyState
        icon={GraduationCap}
        title="Nenhum professor cadastrado"
        description="Adicione professores para começar a gerenciar aulas e cursos."
        action={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Adicionar Professor</Button>}
      />
    </AppLayout>
  );
};

export default TeachersPage;
