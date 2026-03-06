import { AppLayout } from "@/components/layout";
import { usePageTitle } from "@/hooks/usePageTitle";

const ClassesPage = () => {
  usePageTitle("Aulas");
  return (
    <AppLayout title="Aulas">
      <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">Módulo de Aulas — em construção</p>
      </div>
    </AppLayout>
  );
};

export default ClassesPage;
