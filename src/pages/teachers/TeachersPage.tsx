import { AppLayout } from "@/components/layout";
import { usePageTitle } from "@/hooks/usePageTitle";

const TeachersPage = () => {
  usePageTitle("Professores");
  return (
    <AppLayout title="Professores">
      <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">Módulo de Professores — em construção</p>
      </div>
    </AppLayout>
  );
};

export default TeachersPage;
