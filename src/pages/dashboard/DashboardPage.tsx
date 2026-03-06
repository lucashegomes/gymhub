import { AppLayout } from "@/components/layout";
import { usePageTitle } from "@/hooks/usePageTitle";

const DashboardPage = () => {
  usePageTitle("Dashboard");
  return (
    <AppLayout title="Dashboard">
      <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">Dashboard — em construção</p>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
