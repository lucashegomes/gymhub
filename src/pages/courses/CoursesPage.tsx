import { AppLayout } from "@/components/layout";
import { usePageTitle } from "@/hooks/usePageTitle";

const CoursesPage = () => {
  usePageTitle("Cursos");
  return (
    <AppLayout title="Cursos">
      <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">Módulo de Cursos — em construção</p>
      </div>
    </AppLayout>
  );
};

export default CoursesPage;
