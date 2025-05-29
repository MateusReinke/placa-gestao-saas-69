// src/types/dashboardWidgets.ts
// A importação de CardProps foi removida, pois não é exportada pelo @/components/ui/card.

export type WidgetType =
  | "TotalSellers"
  | "TotalClients"
  | "OpenOrders"
  | "CriticalStock"
  | "MonthlyRevenueChart"
  | "ServiceDistributionChart"
  | "StatusDistributionChart"
  | "RecentActivities"
  | "TopSellers";

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
  };
  config?: {
    // Para configurações futuras do widget (título customizado, cores, etc.)
    title?: string;
    // Exemplo para cores de gráfico:
    chartColors?: string[];
    // Outras opções de configuração...
  };
}

export interface DashboardLayout {
  user_id: string; // Corrigido para 'user_id' conforme o DB
  layout_data: DashboardWidget[];
  last_updated: string; // Conforme o nome da coluna no seu DB
}

export interface WidgetMetadata {
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ElementType;
  defaultLayout: { w: number; h: number; minW?: number; minH?: number };
}
