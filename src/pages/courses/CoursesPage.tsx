import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { BookOpen, Plus } from "lucide-react";

const CoursesPage = () => {
  usePageTitle("Cursos");
  return (
    <AppLayout>
      <PageHeader
        title="Cursos"
        description="Gerencie os cursos oferecidos"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Cursos" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Novo Curso</Button>}
      />
      <EmptyState
        icon={BookOpen}
        title="Nenhum curso cadastrado"
        description="Crie cursos e associe professores e horários."
        action={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Criar Curso</Button>}
      />
    </AppLayout>
  );
};

export default CoursesPage;
