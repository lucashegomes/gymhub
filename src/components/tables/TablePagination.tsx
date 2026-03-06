import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const TablePagination = ({ page, totalPages, total, onPageChange }: TablePaginationProps) => (
  <div className="mt-4 flex items-center justify-between">
    <p className="text-sm text-muted-foreground">{total} registro(s)</p>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Anterior
      </Button>
      <span className="text-sm">Página {page} de {totalPages}</span>
      <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Próxima
      </Button>
    </div>
  </div>
);
