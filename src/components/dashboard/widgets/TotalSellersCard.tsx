// src/components/dashboard/widgets/TotalSellersCard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { DashboardStats } from "@/types"; // Importe a interface DashboardStats

interface TotalSellersCardProps {
  stats: DashboardStats | null;
  // Você pode passar outras props, como um manipulador de clique para editar, etc.
}

const TotalSellersCard: React.FC<TotalSellersCardProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total de Vendedores
        </CardTitle>
        <Users className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats?.totalSellers ?? 0}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Vendedores ativos no sistema
        </p>
      </CardContent>
    </Card>
  );
};

export default TotalSellersCard;
