
import React, { useEffect, useState } from 'react';
import { ApiService } from '@/services/api';
import { DashboardStats, Order, Client } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { Calendar, ChartBar, Clock, Inbox, Loader2, TrendingUp, User, Car } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        try {
          const [statsData, ordersData, clientsData] = await Promise.all([
            ApiService.getDashboardStats(user.id, user.role),
            ApiService.getOrders(user.id, user.role),
            ApiService.getClients(user.id, user.role)
          ]);
          
          setStats(statsData);
          
          // Get 5 most recent orders
          const sortedOrders = [...ordersData].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ).slice(0, 5);
          setRecentOrders(sortedOrders);
          
          // Get 3 most recent clients
          const sortedClients = [...clientsData].sort((a, b) => 
            (b.createdAt ? new Date(b.createdAt).getTime() : 0) - 
            (a.createdAt ? new Date(a.createdAt).getTime() : 0)
          ).slice(0, 3);
          setRecentClients(sortedClients);
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
  ];

  // Mock monthly performance data
  const performanceData = [
    { month: 'Jan', orders: 15, target: 20 },
    { month: 'Fev', orders: 18, target: 20 },
    { month: 'Mar', orders: 25, target: 20 },
    { month: 'Abr', orders: 22, target: 25 },
    { month: 'Mai', orders: 28, target: 25 },
    { month: 'Jun', orders: 30, target: 25 },
  ];

  // Helper to get status badge
  const getStatusBadge = (statusName?: string) => {
    if (!statusName) return 'bg-gray-100 text-gray-800';
    
    const statusMap: Record<string, string> = {
      'Novo': 'bg-blue-100 text-blue-800',
      'Pendente': 'bg-amber-100 text-amber-800',
      'Em Andamento': 'bg-violet-100 text-violet-800',
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
            <h1 className="text-3xl font-bold tracking-tight">Dashboard do Vendedor</h1>
            <p className="text-muted-foreground">
              Acompanhe seu desempenho e gerencie seus pedidos.
            </p>
          </div>
          <Button onClick={() => navigate('/vendedor/orders')}>
            Ver Todos os Pedidos
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Clientes</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">42</div>
              <p className="text-xs text-muted-foreground mt-1">
                +5 novos este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos em Aberto</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">
                2 aguardando aprovação
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Finalizados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <p className="text-xs text-muted-foreground mt-1">
                +23 neste mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">76%</div>
              <p className="text-xs text-muted-foreground mt-1">
                +8% desde o último mês
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Chart */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Desempenho Mensal</CardTitle>
              <CardDescription>
                Comparação entre pedidos realizados e metas
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} pedidos`, 'Quantidade']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Legend />
                  <Bar name="Pedidos" dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar name="Meta" dataKey="target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Service Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços Mais Vendidos</CardTitle>
              <CardDescription>
                Distribuição por tipo de serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.ordersByServiceType && stats.ordersByServiceType.length > 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.ordersByServiceType}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="serviceName"
                        label={({ serviceName, count }) => `${count}`}
                      >
                        {stats.ordersByServiceType.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={chartColors[index % chartColors.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any, props: any) => [
                          `${value} pedidos`, 
                          props.payload.serviceName
                        ]}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span>Emplacamento</span>
                    <span className="font-medium">32</span>
                  </div>
                  <div className="h-2 bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '75%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Transferência</span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="h-2 bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-violet-500" style={{ width: '65%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Legalização</span>
                    <span className="font-medium">15</span>
                  </div>
                  <div className="h-2 bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: '45%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Vistorias</span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="h-2 bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '30%' }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Últimos Pedidos</CardTitle>
              <CardDescription>
                Pedidos recentemente criados
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-2">
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 rounded-full bg-primary/10 p-1.5">
                          <Car className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">
                            {order.client?.name || 'Cliente'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {order.serviceType?.name || 'Serviço'} - {order.licensePlate}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusBadge(order.status?.name)}`}
                      >
                        {order.status?.name || 'Status'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <p className="text-muted-foreground text-sm">Nenhum pedido encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => navigate('/vendedor/orders')}
              >
                Ver Todos os Pedidos
              </Button>
            </CardFooter>
          </Card>
          
          {/* Upcoming Deadlines */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prazos Próximos</CardTitle>
                  <CardDescription>
                    Pedidos com prazos de entrega próximos
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Visualizar Calendário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-500/20 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Hoje</h4>
                      <p className="text-xs text-muted-foreground">4 entregas pendentes</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">Emplacamento</p>
                      <p className="text-xs text-muted-foreground">João Silva • ABC-1234</p>
                    </div>
                    <div className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">Transferência</p>
                      <p className="text-xs text-muted-foreground">Maria Souza • DEF-5678</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Amanhã</h4>
                      <p className="text-xs text-muted-foreground">3 entregas pendentes</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">Legalização</p>
                      <p className="text-xs text-muted-foreground">Carlos Almeida • GHI-9012</p>
                    </div>
                    <div className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">Vistorias</p>
                      <p className="text-xs text-muted-foreground">Ana Paula • JKL-3456</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500/20 p-2 rounded-full">
                      <ChartBar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Esta Semana</h4>
                      <p className="text-xs text-muted-foreground">8 entregas pendentes</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">Emplacamento - 5</p>
                      <p className="text-xs text-muted-foreground">Vários clientes</p>
                    </div>
                    <div className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">Transferência - 3</p>
                      <p className="text-xs text-muted-foreground">Vários clientes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SellerDashboard;
