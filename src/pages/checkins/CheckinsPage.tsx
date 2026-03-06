import { AppLayout } from "@/components/layout";
import { usePageTitle } from "@/hooks/usePageTitle";

const CheckinsPage = () => {
  usePageTitle("Check-ins");
  return (
    <AppLayout title="Check-ins">
      <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">Módulo de Check-ins — em construção</p>
      </div>
    </AppLayout>
  );
};

export default CheckinsPage;
