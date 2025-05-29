// src/types/dashboardWidgets.ts
import React from "react";

export type WidgetType =
  | "TotalSellers"
  | "TotalClients"
  | "OpenOrders"
  | "CriticalStock"
  | "MonthlyRevenueChart"
  | "ServiceDistributionChart"
  | "StatusDistributionChart"
  | "RecentActivities"
  | "TopSellers"
  | "CustomData";

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

export interface WidgetConfigDisplay {
  // Renomeado para evitar conflito de nome com tipo primitivo
  columns?: Array<{ key: string; label: string }>;
  xAxisKey?: string;
  yAxisKey?: string;
  valueKey?: string;
  valueLabel?: string;
  aggregation?: "count" | "sum" | "avg";
  unit?: string;
  // Adicione chartType aqui se ainda não estiver
  chartType?: "bar" | "line" | "pie"; // Para CustomDataWidget quando displayType é um gráfico genérico
}

export interface WidgetConfig {
  title?: string;
  chartColors?: string[];
  queryId?: string;
  displayType?:
    | "table"
    | "barChart"
    | "lineChart"
    | "pieChart"
    | "singleValueCard"
    | "textList";
  displayConfig?: WidgetConfigDisplay;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  layout: WidgetLayout;
  config?: WidgetConfig;
}

export interface WidgetMetadata {
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ElementType;
  defaultLayout: { w: number; h: number; minW?: number; minH?: number };
  allowMultipleInstances?: boolean; // <<< Opção A para o erro ts(2367)
}

export interface DashboardLayout {
  user_id: string;
  layout_data: DashboardWidget[];
  last_updated: string;
}
