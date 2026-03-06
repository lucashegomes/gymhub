import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Calendar, Plus } from "lucide-react";

const ClassesPage = () => {
  usePageTitle("Aulas");
  return (
    <AppLayout>
      <PageHeader
        title="Aulas"
        description="Gerencie a grade de aulas"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Aulas" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Nova Aula</Button>}
      />
      <EmptyState
        icon={Calendar}
        title="Nenhuma aula agendada"
        description="Agende aulas vinculadas a cursos e professores."
        action={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Agendar Aula</Button>}
      />
    </AppLayout>
  );
};

export default ClassesPage;
