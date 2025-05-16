
import React, { useEffect, useState } from 'react';
import { ApiService } from '@/services/api';
import { DashboardStats } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Calendar, ChartBar, ChartPie, Info, List, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        try {
          const data = await ApiService.getDashboardStats(user.id, user.role);
          setStats(data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Chart colors
  const chartColors = [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#f97316', // orange-500
    '#22c55e', // green-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#eab308', // yellow-500
  ];

  // Mock data for revenue trend
  const revenueTrend = [
    { month: 'Jan', revenue: 12500 },
    { month: 'Fev', revenue: 14200 },
    { month: 'Mar', revenue: 16800 },
    { month: 'Abr', revenue: 15400 },
    { month: 'Mai', revenue: 18900 },
    { month: 'Jun', revenue: 17600 },
  ];

  // Mock data for recent activities
  const recentActivities = [
    { id: 1, user: 'Maria Silva', action: 'Pedido criado', time: '10 minutos atrás' },
    { id: 2, user: 'João Santos', action: 'Status atualizado', time: '25 minutos atrás' },
    { id: 3, user: 'Ana Pereira', action: 'Cliente cadastrado', time: '1 hora atrás' },
    { id: 4, user: 'Carlos Mendes', action: 'Estoque atualizado', time: '2 horas atrás' },
  ];

  // Helper to get status badge color
  const getStatusBadge = (statusName: string) => {
    const statusMap: Record<string, string> = {
      'Novo': 'bg-blue-100 text-blue-800',
      'Em Andamento': 'bg-violet-100 text-violet-800',
      'Pendente': 'bg-amber-100 text-amber-800',
      'Concluído': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800',
    };
    
    return statusMap[statusName] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Carregando dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Administrador</h1>
            <p className="text-muted-foreground">
              Visão geral da gestão do sistema e métricas importantes.
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendedores</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">15</div>
              <p className="text-xs text-muted-foreground mt-1">
                +2 cadastrados neste mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">124</div>
              <p className="text-xs text-muted-foreground mt-1">
                +18 desde o mês passado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos em Aberto</CardTitle>
              <List className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">32</div>
              <p className="text-xs text-muted-foreground mt-1">
                6 pendentes de aprovação
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">450</div>
              <p className="text-xs text-muted-foreground mt-1">
                3 itens em nível crítico
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Trend Card */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Tendência de Faturamento</CardTitle>
              <CardDescription>
                Faturamento mensal dos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        compactDisplay: 'short',
                        currency: 'BRL',
                      }).format(value)
                    } 
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      formatCurrency(value), 
                      "Faturamento"
                    ]}
                    labelFormatter={(label) => `Mês: ${label}`}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribution by Service Type */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Distribuição por Serviço</CardTitle>
                <CardDescription>Percentual por tipo de serviço</CardDescription>
              </div>
              <ChartPie className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-80">
              {stats?.ordersByServiceType && stats.ordersByServiceType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.ordersByServiceType}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="serviceName"
                      label={({ serviceName, percent }) => 
                        `${serviceName}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stats.ordersByServiceType.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={chartColors[index % chartColors.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} pedidos`, 'Quantidade']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Status Distribution */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Pedidos agrupados por status</CardDescription>
              </div>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats?.ordersByStatus.map((status, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{backgroundColor: chartColors[index % chartColors.length]}} 
                        />
                        <span className="text-sm font-medium">
                          {status.statusName}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {status.count} pedidos
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(status.count / stats.totalOrders) * 100}%`,
                          backgroundColor: chartColors[index % chartColors.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-4 border-b pb-3 last:border-0 last:pb-0">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Estoque em Alerta</CardTitle>
                <CardDescription>Itens que precisam de reposição</CardDescription>
              </div>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Placas Mercosul</TableCell>
                    <TableCell>12 un.</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">Atenção</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Adesivos</TableCell>
                    <TableCell>5 un.</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-100 text-red-800">Crítico</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lacres</TableCell>
                    <TableCell>25 un.</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">Atenção</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Top Sellers */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Top Vendedores</CardTitle>
                <CardDescription>Desempenho do mês atual</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
