import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ClipboardCheck, Plus } from "lucide-react";

const CheckinsPage = () => {
  usePageTitle("Check-ins");
  return (
    <AppLayout>
      <PageHeader
        title="Check-ins"
        description="Registros de entrada e saída"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Check-ins" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Novo Check-in</Button>}
      />
      <EmptyState
        icon={ClipboardCheck}
        title="Nenhum check-in registrado"
        description="Os check-ins dos alunos aparecerão aqui."
        action={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Registrar Check-in</Button>}
      />
    </AppLayout>
  );
};

export default CheckinsPage;
