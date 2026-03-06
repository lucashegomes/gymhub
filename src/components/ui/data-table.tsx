import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowUpDown, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (key: string) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Nenhum registro encontrado",
  emptyDescription = "Tente ajustar os filtros ou adicione um novo registro.",
  onRowClick,
  sortKey,
  sortDirection,
  onSortChange,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-4 w-full max-w-[180px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={FileX}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.sortable ? (
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold"
                    onClick={() => onSortChange?.(col.key)}
                  >
                    {col.header}
                    <ArrowUpDown className={`ml-2 h-3.5 w-3.5 ${sortKey === col.key ? "opacity-100" : "opacity-40"}`} />
                    {sortKey === col.key && (
                      <span className="ml-1 text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </Button>
                ) : col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className={onRowClick ? "cursor-pointer" : ""}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
