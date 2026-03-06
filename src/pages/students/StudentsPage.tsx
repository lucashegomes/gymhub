import { AppLayout } from "@/components/layout";
import { usePageTitle } from "@/hooks/usePageTitle";

const StudentsPage = () => {
  usePageTitle("Alunos");
  return (
    <AppLayout title="Alunos">
      <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">Módulo de Alunos — em construção</p>
      </div>
    </AppLayout>
  );
};

export default StudentsPage;
