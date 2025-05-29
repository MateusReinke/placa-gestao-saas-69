// src/pages/admin/Dashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import { DashboardStats } from "@/types";
import {
  DashboardWidget,
  WidgetType,
  WidgetMetadata,
} from "@/types/dashboardWidgets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CirclePlus,
  Trash2,
  Loader2,
  Users,
  Package,
  History,
  Info,
  LineChart as LineChartIcon, // Renomeado para evitar conflito com componente Recharts
  PieChart as PieChartIcon, // Renomeado
  BarChart as BarChartIcon, // Renomeado
  List,
  CircleAlert,
  Settings, // Importar Settings para o botão de edição
} from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardService } from "@/services/dashboardApi";
import { DashboardLayoutService } from "@/services/dashboardLayoutService";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// IMPORTANTE: Importações corretas do Recharts. Todos os componentes necessários aqui.
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
} from "recharts";

// react-grid-layout imports
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css"; // Estilos para as alças de redimensionamento

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Componentes de Widget Reutilizáveis (INLINE TEMPORARIAMENTE) ---
// Idealmente, cada um desses componentes estaria em seu próprio arquivo (ex: src/components/dashboard/widgets/TotalSellers.tsx)
// Todos foram prefixados com 'Widget' para evitar conflitos de nomes.

const WidgetTotalSellers: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {config?.title || "Total de Vendedores"}
      </CardTitle>
      <Users className="h-4 w-4 text-green-500" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{stats?.totalSellers ?? 0}</div>
      <p className="text-xs text-muted-foreground mt-1">Vendedores ativos</p>
    </CardContent>
  </Card>
);

const WidgetTotalClients: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {config?.title || "Total de Clientes"}
      </CardTitle>
      <Users className="h-4 w-4 text-green-500" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{stats?.totalClients ?? 0}</div>
      <p className="text-xs text-muted-foreground mt-1">Clientes cadastrados</p>
    </CardContent>
  </Card>
);

const WidgetOpenOrders: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {config?.title || "Pedidos em Aberto"}
      </CardTitle>
      <List className="h-4 w-4 text-amber-500" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">
        {stats
          ? stats.totalOrders -
            (stats.ordersByStatus.find((s) => s.status_name === "Concluído")
              ?.count || 0) -
            (stats.ordersByStatus.find((s) => s.status_name === "Cancelado")
              ?.count || 0)
          : 0}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Total de pedidos em andamento
      </p>
    </CardContent>
  </Card>
);

const WidgetCriticalStock: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {config?.title || "Itens em Estoque Crítico"}
      </CardTitle>
      <Package className="h-4 w-4 text-orange-500" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">
        {stats?.lowStockItems.length ?? 0}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Itens precisam de reposição
      </p>
    </CardContent>
  </Card>
);

const WidgetMonthlyRevenueChart: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  // Cores personalizadas do config, ou padrão
  const chartColors = config?.chartColors || ["#3b82f6", "#8b5cf6"];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          {config?.title || "Tendência de Faturamento e Pedidos"}
        </CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent className="h-4/5 pt-0">
        {stats?.ordersByMonth && stats.ordersByMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.ordersByMonth}>
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" stroke={chartColors[0]} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={chartColors[1]}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "revenue") {
                    return [formatCurrency(value), "Faturamento"];
                  } else {
                    return [`${value} pedidos`, "Quantidade"];
                  }
                }}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Faturamento"
                stroke={chartColors[0]}
                strokeWidth={2}
                dot={{ fill: chartColors[0], r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="count"
                name="Pedidos"
                stroke={chartColors[1]}
                strokeWidth={2}
                dot={{ fill: chartColors[1], r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Nenhum dado disponível.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const WidgetServiceDistributionChart: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  // Cores personalizadas do config, ou padrão
  const chartColors = config?.chartColors || [
    "#3b82f6",
    "#06b6d4",
    "#8b5cf6",
    "#ef4444",
    "#f97316",
    "#eab308",
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{config?.title || "Distribuição por Serviço"}</CardTitle>
        <CardDescription>Percentual por tipo</CardDescription>
      </CardHeader>
      <CardContent className="h-4/5 pt-0">
        {stats?.ordersByServiceType && stats.ordersByServiceType.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.ordersByServiceType}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="count"
                nameKey="service_name"
                label={({ service_name, percent }) =>
                  `${service_name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {stats.ordersByServiceType.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, props: any) => [
                  `${value} pedidos`,
                  props.payload.service_name,
                ]}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Nenhum dado disponível.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const WidgetStatusDistributionChart: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const chartColors = config?.chartColors || [
    "#3b82f6",
    "#8b5cf6",
    "#f97316",
    "#22c55e",
    "#ef4444",
  ];
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{config?.title || "Distribuição por Status"}</CardTitle>
        <CardDescription>Pedidos agrupados</CardDescription>
      </CardHeader>
      <CardContent className="h-4/5 pt-0">
        <div className="space-y-4">
          {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
            stats.ordersByStatus.map((status, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        status.color || chartColors[index % chartColors.length],
                    }}
                  />
                  <span className="text-sm font-medium">
                    {status.status_name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {status.count} pedidos
                </span>
                <div className="h-2 bg-secondary rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(status.count / stats.totalOrders) * 100}%`,
                      backgroundColor:
                        status.color || chartColors[index % chartColors.length],
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Nenhum dado disponível.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const WidgetRecentActivities: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const formatActivityTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">
          {config?.title || "Atividades Recentes"}
        </CardTitle>
        <CardDescription>Últimas ações no sistema</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  {activity.type === "order" && <List className="h-4 w-4" />}
                  {activity.type === "client" && <Users className="h-4 w-4" />}
                  {activity.type === "inventory_movement" && (
                    <Package className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatActivityTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                Nenhuma atividade recente.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const WidgetTopSellers: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle>{config?.title || "Top Vendedores"}</CardTitle>
      <CardDescription>Desempenho do mês atual</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendedor</TableHead>
            <TableHead>Pedidos</TableHead>
            <TableHead>Conversão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Ana Silva</TableCell>
            <TableCell>18</TableCell>
            <TableCell className="text-green-600">85%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Paulo Costa</TableCell>
            <TableCell>15</TableCell>
            <TableCell className="text-green-600">78%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Márcia Santos</TableCell>
            <TableCell>12</TableCell>
            <TableCell className="text-amber-600">65%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              colSpan={3}
              className="text-center text-muted-foreground"
            >
              Dados mockados - Implementar lógica de Top Vendedores
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// Mapeamento dos tipos de widget para seus componentes React
const widgetComponents: Record<
  WidgetType,
  React.ComponentType<{
    stats: DashboardStats | null;
    config?: Record<string, any>;
  }>
> = {
  TotalSellers: WidgetTotalSellers,
  TotalClients: WidgetTotalClients,
  OpenOrders: WidgetOpenOrders,
  CriticalStock: WidgetCriticalStock,
  MonthlyRevenueChart: WidgetMonthlyRevenueChart,
  ServiceDistributionChart: WidgetServiceDistributionChart,
  StatusDistributionChart: WidgetStatusDistributionChart,
  RecentActivities: WidgetRecentActivities,
  TopSellers: WidgetTopSellers,
};

const availableWidgets: WidgetMetadata[] = [
  {
    type: "TotalSellers",
    title: "Total de Vendedores",
    description: "Número total de vendedores cadastrados.",
    icon: Users,
    defaultLayout: { w: 1, h: 1, minW: 1, minH: 1 },
  },
  {
    type: "TotalClients",
    title: "Total de Clientes",
    description: "Número total de clientes cadastrados.",
    icon: Users,
    defaultLayout: { w: 1, h: 1, minW: 1, minH: 1 },
  },
  {
    type: "OpenOrders",
    title: "Pedidos em Aberto",
    description: "Contagem de pedidos com status não-concluídos.",
    icon: List,
    defaultLayout: { w: 1, h: 1, minW: 1, minH: 1 },
  },
  {
    type: "CriticalStock",
    title: "Itens em Estoque Crítico",
    description: "Itens de estoque com quantidade baixa ou crítica.",
    icon: CircleAlert,
    defaultLayout: { w: 1, h: 1, minW: 1, minH: 1 },
  },
  {
    type: "MonthlyRevenueChart",
    title: "Faturamento Mensal",
    description: "Gráfico de faturamento e pedidos por mês.",
    icon: LineChartIcon,
    defaultLayout: { w: 2, h: 3, minW: 2, minH: 2 },
  },
  {
    type: "ServiceDistributionChart",
    title: "Serviços Mais Vendidos",
    description: "Gráfico de distribuição de pedidos por tipo de serviço.",
    icon: PieChartIcon,
    defaultLayout: { w: 1, h: 3, minW: 1, minH: 2 },
  },
  {
    type: "StatusDistributionChart",
    title: "Pedidos por Status",
    description: "Distribuição de pedidos por status.",
    icon: BarChartIcon,
    defaultLayout: { w: 1, h: 3, minW: 1, minH: 2 },
  },
  {
    type: "RecentActivities",
    title: "Atividades Recentes",
    description: "Últimas ações no sistema.",
    icon: History,
    defaultLayout: { w: 2, h: 3, minW: 1, minH: 2 },
  },
  {
    type: "TopSellers",
    title: "Top Vendedores",
    description: "Ranking dos vendedores com melhor desempenho.",
    icon: Users,
    defaultLayout: { w: 2, h: 3, minW: 1, minH: 2 },
  },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLayout, setLoadingLayout] = useState(true);
  const [currentLayout, setCurrentLayout] = useState<DashboardWidget[]>([]);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false); // Novo estado para o modo de edição

  // Layouts padrões para diferentes tamanhos de tela (como fallback)
  const defaultLayouts = {
    lg: [
      { id: "TotalSellers", x: 0, y: 0, w: 1, h: 1 },
      { id: "TotalClients", x: 1, y: 0, w: 1, h: 1 },
      { id: "OpenOrders", x: 2, y: 0, w: 1, h: 1 },
      { id: "CriticalStock", x: 3, y: 0, w: 1, h: 1 },
      { id: "MonthlyRevenueChart", x: 0, y: 1, w: 2, h: 3 },
      { id: "ServiceDistributionChart", x: 2, y: 1, w: 1, h: 3 },
      { id: "StatusDistributionChart", x: 3, y: 1, w: 1, h: 3 },
      { id: "RecentActivities", x: 0, y: 4, w: 2, h: 3 },
      { id: "TopSellers", x: 2, y: 4, w: 2, h: 3 },
    ].map((item) => ({
      ...item,
      type: item.id as WidgetType,
      config: {},
      i: item.id,
    })),
    md: [
      { id: "TotalSellers", x: 0, y: 0, w: 1, h: 1 },
      { id: "TotalClients", x: 1, y: 0, w: 1, h: 1 },
      { id: "OpenOrders", x: 0, y: 1, w: 1, h: 1 },
      { id: "CriticalStock", x: 1, y: 1, w: 1, h: 1 },
      { id: "MonthlyRevenueChart", x: 0, y: 2, w: 2, h: 3 },
      { id: "ServiceDistributionChart", x: 0, y: 5, w: 1, h: 3 },
      { id: "StatusDistributionChart", x: 1, y: 5, w: 1, h: 3 },
      { id: "RecentActivities", x: 0, y: 8, w: 2, h: 3 },
      { id: "TopSellers", x: 0, y: 11, w: 2, h: 3 },
    ].map((item) => ({
      ...item,
      type: item.id as WidgetType,
      config: {},
      i: item.id,
    })),
    sm: [
      { id: "TotalSellers", x: 0, y: 0, w: 1, h: 1 },
      { id: "TotalClients", x: 0, y: 1, w: 1, h: 1 },
      { id: "OpenOrders", x: 0, y: 2, w: 1, h: 1 },
      { id: "CriticalStock", x: 0, y: 3, w: 1, h: 1 },
      { id: "MonthlyRevenueChart", x: 0, y: 4, w: 1, h: 3 },
      { id: "ServiceDistributionChart", x: 0, y: 7, w: 1, h: 3 },
      { id: "StatusDistributionChart", x: 0, y: 10, w: 1, h: 3 },
      { id: "RecentActivities", x: 0, y: 13, w: 1, h: 3 },
      { id: "TopSellers", x: 0, y: 16, w: 1, h: 3 },
    ].map((item) => ({
      ...item,
      type: item.id as WidgetType,
      config: {},
      i: item.id,
    })),
  };

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      if (user && user.role === "admin") {
        try {
          const data = await DashboardService.getAdminDashboardStats();
          setStats(data);
        } catch (error) {
          console.error("Error fetching dashboard stats:", error);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  // Load user layout from Supabase
  useEffect(() => {
    const loadLayout = async () => {
      if (user?.id) {
        setLoadingLayout(true);
        try {
          const savedLayout = await DashboardLayoutService.getLayout(user.id);
          if (savedLayout && savedLayout.length > 0) {
            // Garante que o 'i' do react-grid-layout é o 'id' do seu widget
            // E que as propriedades 'layout' têm os min/max W/H se não vierem do DB
            const layoutWithI = savedLayout.map((item) => {
              const widgetMeta = availableWidgets.find(
                (w) => w.type === item.type
              );
              return {
                ...item,
                i: item.id,
                layout: {
                  x: item.layout.x,
                  y: item.layout.y,
                  w: item.layout.w,
                  h: item.layout.h,
                  minW: item.layout.minW || widgetMeta?.defaultLayout.minW,
                  maxW: item.layout.maxW || widgetMeta?.defaultLayout.maxW,
                  minH: item.layout.minH || widgetMeta?.defaultLayout.minH,
                  maxH: item.layout.maxH || widgetMeta?.defaultLayout.maxH,
                },
              };
            });
            setCurrentLayout(layoutWithI);
          } else {
            setCurrentLayout(defaultLayouts.lg);
          }
        } catch (error) {
          console.error("Erro ao carregar layout:", error);
          setCurrentLayout(defaultLayouts.lg);
        } finally {
          setLoadingLayout(false);
        }
      }
    };
    loadLayout();
  }, [user?.id]);

  // Save layout to Supabase when it changes
  const onLayoutChange = useCallback(
    (layout: any[], allLayouts: any) => {
      if (!user?.id || loadingLayout) return;

      const newLayout: DashboardWidget[] = layout.map((item) => {
        const existingWidget = currentLayout.find((w) => w.id === item.i);
        return {
          id: item.i,
          type: existingWidget?.type || (item.i as WidgetType),
          layout: {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            minW: item.minW,
            maxW: item.maxW,
            minH: item.minH,
            maxH: item.maxH,
          },
          config: existingWidget?.config || {},
        };
      });
      setCurrentLayout(newLayout);
      DashboardLayoutService.saveLayout(user.id, newLayout)
        .then(() => console.log("Layout salvo automaticamente."))
        .catch((err) =>
          console.error("Falha ao salvar layout automático:", err)
        );
    },
    [user?.id, loadingLayout, currentLayout]
  );

  // Add a new widget
  const addWidget = (widgetType: WidgetType) => {
    const widgetMeta = availableWidgets.find((w) => w.type === widgetType);
    if (!widgetMeta) return;

    const newId = `${widgetType}-${Date.now()}`;
    const newWidget: DashboardWidget = {
      id: newId,
      type: widgetType,
      layout: {
        x: (currentLayout.length * 2) % 4,
        y: Infinity, // Coloca o novo widget na próxima linha disponível
        w: widgetMeta.defaultLayout.w,
        h: widgetMeta.defaultLayout.h,
        minW: widgetMeta.defaultLayout.minW,
        minH: widgetMeta.defaultLayout.minH,
      },
      config: {},
    };

    const updatedLayout = [...currentLayout, newWidget];
    setCurrentLayout(updatedLayout);
    DashboardLayoutService.saveLayout(user!.id, updatedLayout)
      .then(() =>
        console.log(`Widget ${widgetType} adicionado e layout salvo.`)
      )
      .catch((err) =>
        console.error("Falha ao adicionar widget e salvar layout:", err)
      );

    setIsAddWidgetDialogOpen(false);
  };

  // Remove a widget
  const removeWidget = (widgetId: string) => {
    const updatedLayout = currentLayout.filter(
      (widget) => widget.id !== widgetId
    );
    setCurrentLayout(updatedLayout);
    DashboardLayoutService.saveLayout(user!.id, updatedLayout)
      .then(() => console.log(`Widget ${widgetId} removido e layout salvo.`))
      .catch((err) =>
        console.error("Falha ao remover widget e salvar layout:", err)
      );
  };

  if (loadingStats || loadingLayout) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Carregando dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  if (!stats) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
          <Info className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Não foi possível carregar os dados do dashboard.
          </p>
          <p className="text-sm text-muted-foreground">
            Verifique a conexão com o Supabase e se há dados nas tabelas.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard de Administrador
            </h1>
            <p className="text-muted-foreground">
              Personalize sua visão geral com os widgets abaixo.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isEditingLayout ? "secondary" : "outline"}
              onClick={() => setIsEditingLayout((prev) => !prev)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isEditingLayout ? "Sair do Modo Edição" : "Editar Dashboard"}
            </Button>
            <Dialog
              open={isAddWidgetDialogOpen}
              onOpenChange={setIsAddWidgetDialogOpen}
            >
              <DialogTrigger asChild>
                <Button disabled={!isEditingLayout}>
                  <CirclePlus className="h-4 w-4 mr-2" />
                  Adicionar Widget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Widget</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                  {availableWidgets.map((widget) => (
                    <Button
                      key={widget.type}
                      variant="outline"
                      onClick={() => addWidget(widget.type)}
                      className="justify-start gap-2"
                      disabled={currentLayout.some(
                        (item) => item.type === widget.type
                      )}
                    >
                      {React.createElement(widget.icon, {
                        className: "h-4 w-4",
                      })}
                      {widget.title}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {currentLayout.length === 0 && !loadingLayout ? (
          <div className="flex flex-col items-center justify-center h-60 border rounded-md p-4 text-muted-foreground">
            <Info className="h-10 w-10 mb-3" />
            <p className="text-lg font-medium">Seu dashboard está vazio!</p>
            <p className="text-sm">
              Clique em "Adicionar Widget" para começar a personalizar.
            </p>
          </div>
        ) : (
          <ResponsiveGridLayout
            className={`layout ${isEditingLayout ? "is-editing" : ""}`}
            layouts={{
              lg: currentLayout.map((item) => ({ ...item.layout, i: item.id })),
              md: currentLayout.map((item) => ({ ...item.layout, i: item.id })),
              sm: currentLayout.map((item) => ({ ...item.layout, i: item.id })),
            }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 1 }}
            cols={{ lg: 4, md: 2, sm: 1, xs: 1, xxs: 1 }}
            rowHeight={100}
            onLayoutChange={onLayoutChange}
            measureBeforeMount={false}
            isResizable={isEditingLayout}
            isDraggable={isEditingLayout}
            compactType="vertical"
            preventCollision={true}
            margin={[10, 10]}
            containerPadding={[10, 10]}
          >
            {isEditingLayout && <div className="grid-background" />}{" "}
            {/* Fundo quadriculado */}
            {currentLayout.map((widget) => {
              const WidgetComponent = widgetComponents[widget.type];
              if (!WidgetComponent) {
                return (
                  <div
                    key={widget.id}
                    data-grid={{ ...widget.layout, i: widget.id }}
                  >
                    <Card className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                      <Info className="h-8 w-8 mb-2" />
                      <p className="text-sm">
                        Widget "{widget.type}" não encontrado.
                      </p>
                      {isEditingLayout && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeWidget(widget.id)}
                          className="mt-2"
                        >
                          Remover
                        </Button>
                      )}
                    </Card>
                  </div>
                );
              }

              return (
                <div
                  key={widget.id}
                  data-grid={{ ...widget.layout, i: widget.id }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {widget.config?.title ||
                          availableWidgets.find((w) => w.type === widget.type)
                            ?.title ||
                          widget.type}
                      </CardTitle>
                      {isEditingLayout && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <span className="sr-only">Ações</span>
                              <span className="text-sm">...</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              Ações do Widget
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                alert(`Configurar Widget: ${widget.type}`); // Placeholder para futura configuração
                              }}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configurar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => removeWidget(widget.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                      {React.createElement(WidgetComponent, {
                        stats: stats,
                        config: widget.config,
                      })}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
