import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Checkin } from "@/types";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

interface CheckinHistoryModalProps {
  open: boolean;
  studentId?: string;
  studentName?: string;
  onOpenChange: (value: boolean) => void;
}

export function CheckinHistoryModal({ open, studentId, studentName, onOpenChange }: CheckinHistoryModalProps) {
  const [items, setItems] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !studentId) return;
    setLoading(true);
    const token = localStorage.getItem("gymhub:auth:token") || "";

    fetch(`${API_BASE_URL}/students/${studentId}/checkins/history?page=1&pageSize=100`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ data: Checkin[] }>;
      })
      .then((payload) => setItems(payload.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open, studentId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Student Check-in History {studentName ? `- ${studentName}` : ""}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando histórico...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Aula</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{new Date(item.checkinTime).toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{item.courseName || "-"}</TableCell>
                  <TableCell>{item.className || "-"}</TableCell>
                  <TableCell>{item.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

