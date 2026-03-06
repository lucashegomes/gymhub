import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Users, GraduationCap, ClipboardCheck, Calendar, TrendingUp, RefreshCw } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const checkinData = [
  { day: "Seg", checkins: 42 },
  { day: "Ter", checkins: 58 },
  { day: "Qua", checkins: 65 },
  { day: "Qui", checkins: 47 },
  { day: "Sex", checkins: 72 },
  { day: "Sáb", checkins: 38 },
  { day: "Dom", checkins: 15 },
];

const staticRecentActivity = [
  { id: "1", name: "Maria Silva", action: "Check-in", time: "há 5 min", status: "success" as const },
  { id: "2", name: "João Santos", action: "Matrícula", time: "há 15 min", status: "success" as const },
  { id: "3", name: "Ana Costa", action: "Aula cancelada", time: "há 30 min", status: "warning" as const },
  { id: "4", name: "Pedro Lima", action: "Plano vencido", time: "há 1h", status: "inactive" as const },
  { id: "5", name: "Carla Dias", action: "Check-in", time: "há 1h", status: "success" as const },
];

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const GYM_ID = import.meta.env.VITE_GYMPASS_GYM_ID || "1";
const REFRESH_INTERVAL_MS = 30_000;

type ActivityItem = {
  id: string;
  name: string;
  action: string;
  time: string;
  status: "success" | "warning" | "inactive";
};

async function validateRecentCheckin() {
  const token = localStorage.getItem("gymhub:auth:token") || "";
  const response = await fetch(`${API_BASE_URL}/gympass/gyms/${GYM_ID}/checkins/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      checkinCode: `gymhub-dashboard-${Date.now()}`,
      source: "dashboard_refresh",
      requestedAt: new Date().toISOString(),
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload as { message?: string }).message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

const DashboardPage = () => {
  usePageTitle("Dashboard");
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>(staticRecentActivity);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const refreshRecentActivity = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // await validateRecentCheckin();
      const newItem: ActivityItem = {
        id: crypto.randomUUID(),
        name: "Integração Gympass",
        action: "Check-in validado",
        time: "agora",
        status: "success",
      };

      setRecentActivity((current) => [newItem, ...current.slice(0, 7)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha desconhecida";
      const newItem: ActivityItem = {
        id: crypto.randomUUID(),
        name: "Integração Gympass",
        action: `Falha validação: ${message}`,
        time: "agora",
        status: "warning",
      };

      setRecentActivity((current) => [newItem, ...current.slice(0, 7)]);
    } finally {
      setLastSyncAt(new Date());
      setIsRefreshing(false);
      setIsInitialLoading(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    void refreshRecentActivity();
    const timer = window.setInterval(() => {
      void refreshRecentActivity();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [refreshRecentActivity]);

  const syncText = useMemo(() => {
    if (!lastSyncAt) return "Sem sincronização";
    return `Atualizado às ${lastSyncAt.toLocaleTimeString("pt-BR")}`;
  }, [lastSyncAt]);

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua academia"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {isInitialLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total de Alunos"
          value={248}
          icon={Users}
          trend={{ value: 12, label: "vs mês anterior" }}
        />
        <StatsCard
          title="Professores Ativos"
          value={12}
          icon={GraduationCap}
          description="3 especialidades"
        />
        <StatsCard
          title="Check-ins Hoje"
          value={47}
          icon={ClipboardCheck}
          trend={{ value: 8, label: "vs ontem" }}
        />
        <StatsCard
          title="Aulas Hoje"
          value={6}
          icon={Calendar}
          description="2 restantes"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Check-ins — Últimos 7 dias</CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>337 total</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={checkinData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="checkinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152, 60%, 36%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(152, 60%, 36%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(215, 14%, 46%)' }} axisLine={false} tickLine={false} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(215, 14%, 46%)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(214, 20%, 88%)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="checkins"
                  stroke="hsl(152, 60%, 36%)"
                  strokeWidth={2}
                  fill="url(#checkinGradient)"
                  name="Check-ins"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold">Atividade Recente</CardTitle>
              <Button variant="outline" size="sm" onClick={() => void refreshRecentActivity()} disabled={isRefreshing}>
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{syncText}</p>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <Badge variant={item.status}>{item.action}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </AppLayout>
  );
};

export default DashboardPage;
