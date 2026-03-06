import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

interface ExportButtonProps<T> {
  data: T[];
  fileName: string;
  columns: Array<{ key: keyof T | string; label: string }>;
}

function toCsv<T>(rows: T[], columns: Array<{ key: keyof T | string; label: string }>) {
  const header = columns.map((col) => col.label).join(";");
  const body = rows.map((row) =>
    columns
      .map((col) => {
        const value = String((row as Record<string, unknown>)[col.key as string] ?? "");
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(";"),
  );
  return [header, ...body].join("\n");
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportButton<T>({ data, fileName, columns }: ExportButtonProps<T>) {
  const exportCsv = () => {
    downloadFile(toCsv(data, columns), `${fileName}.csv`, "text/csv;charset=utf-8;");
  };

  const exportXlsx = () => {
    // fallback simples (CSV com extensão XLSX) sem dependência externa
    downloadFile(toCsv(data, columns), `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  };

  const exportPdf = () => {
    const title = `${fileName}`;
    const htmlRows = data
      .map((row) => `<tr>${columns.map((col) => `<td>${String((row as Record<string, unknown>)[col.key as string] ?? "")}</td>`).join("")}</tr>`)
      .join("");
    const html = `
      <html><head><title>${title}</title><style>
      body{font-family:Arial,sans-serif;padding:24px;} table{border-collapse:collapse;width:100%;}
      th,td{border:1px solid #ddd;padding:8px;font-size:12px;text-align:left;} th{background:#f4f4f4;}
      </style></head><body><h2>${title}</h2><table><thead><tr>${columns.map((col) => `<th>${col.label}</th>`).join("")}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>
    `;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCsv}>CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={exportXlsx}>XLSX</DropdownMenuItem>
        <DropdownMenuItem onClick={exportPdf}>PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

